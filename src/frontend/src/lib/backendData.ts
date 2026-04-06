/**
 * backendData.ts
 * Async functions for reading/writing data via the ICP backend canister.
 * Falls back to localStorage if backend is unavailable.
 * All data written to backend is also cached in localStorage.
 *
 * IMAGE STORAGE STRATEGY:
 * Employee photos and service images cannot be stored as ExternalBlob (Uint8Array)
 * on the backend because ExternalBlob.fromURL(base64) fails in practice.
 * Instead, we store all images (employee photos, service images, gallery, vision,
 * mission) inside a single extended JSON blob using setCompaniesJson.
 * Format: { companies, employeePhotos, serviceImages, gallery, vision, mission }
 * Each image is compressed to ~30-50KB before storage to stay within ICP limits.
 */

import type {
  Invoice as BackendInvoice,
  CustomerAccount,
  CustomerOrder,
  SecurityAnswers,
  backendInterface,
} from "@/backend";
import {
  type BillingCustomer as FEBillingCustomer,
  type BillingItem as FEBillingItem,
  type ContactMessage as FEContactMessage,
  type Employee as FEEmployee,
  type Invoice as FEInvoice,
  type CustomerOrder as FEOrder,
  type Review as FEReview,
  type Service as FEService,
  addBillingItemToStorage,
  deleteBillingItemFromStorage,
  getBannerImage,
  getBillingItems,
  getContactMessages,
  getEmployees,
  getInvoices,
  getLogo,
  getOrders,
  getReviews,
  getServices,
  addInvoice as lsAddInvoice,
  addOrder as lsAddOrder,
  deleteInvoice as lsDeleteInvoice,
  deleteOrder as lsDeleteOrder,
  setBannerImage as lsSetBannerImage,
  setLogo as lsSetLogo,
  updateInvoice as lsUpdateInvoice,
  updateOrder as lsUpdateOrder,
  saveBillingCustomers,
  saveBillingItems,
  saveContactMessages,
  saveEmployees,
  saveOrders,
  saveReviews,
  saveServices,
  updateBillingItemInStorage,
} from "./storage";

// Re-export frontend types for convenience
export type {
  FEBillingCustomer as BillingCustomer,
  FEBillingItem as BillingItem,
  FEContactMessage as ContactMessage,
  FEEmployee as Employee,
  FEOrder as Order,
  FEReview as Review,
  FEService as Service,
};

// Company type (used by About page and Admin panel)
export interface Company {
  id: string;
  name: string;
  logo: string; // base64 or empty string
}

// -----------------------------------------------------------------------
// Extended data format stored in getCompaniesJson / setCompaniesJson
// -----------------------------------------------------------------------

interface ExtendedData {
  companies: Company[];
  employeePhotos: Record<string, string>; // employeeId -> compressed base64
  serviceImages: Record<string, string>; // serviceId -> compressed base64
  gallery: string[]; // array of compressed base64 images
  vision: string;
  mission: string;
}

function parseExtendedData(json: string): ExtendedData {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      // Legacy format — just companies array
      return {
        companies: parsed as Company[],
        employeePhotos: {},
        serviceImages: {},
        gallery: [],
        vision: "",
        mission: "",
      };
    }
    return {
      companies: parsed.companies || [],
      employeePhotos: parsed.employeePhotos || {},
      serviceImages: parsed.serviceImages || {},
      gallery: parsed.gallery || [],
      vision: parsed.vision || "",
      mission: parsed.mission || "",
    };
  } catch {
    return {
      companies: [],
      employeePhotos: {},
      serviceImages: {},
      gallery: [],
      vision: "",
      mission: "",
    };
  }
}

const EXTENDED_LS_KEY = "idpc_extended_data";

function getLocalExtendedData(): ExtendedData {
  const raw = localStorage.getItem(EXTENDED_LS_KEY);
  if (raw) return parseExtendedData(raw);
  // Fallback: migrate legacy companies data
  const legacyCompanies = localStorage.getItem("idpc_companies");
  if (legacyCompanies) return parseExtendedData(legacyCompanies);
  return {
    companies: [],
    employeePhotos: {},
    serviceImages: {},
    gallery: [],
    vision: "",
    mission: "",
  };
}

function saveLocalExtendedData(data: ExtendedData): void {
  const json = JSON.stringify(data);
  localStorage.setItem(EXTENDED_LS_KEY, json);
  // Keep legacy key in sync for backwards compatibility
  localStorage.setItem("idpc_companies", JSON.stringify(data.companies));
}

// Cache to avoid re-fetching extended data within the same call chain
let _extDataCache: ExtendedData | null = null;
let _extDataCacheTime = 0;
const EXT_DATA_CACHE_MS = 500;

async function fetchExtendedData(
  actor: backendInterface | null,
): Promise<ExtendedData> {
  // Return cache if fresh enough
  if (_extDataCache && Date.now() - _extDataCacheTime < EXT_DATA_CACHE_MS) {
    return _extDataCache;
  }
  try {
    if (actor) {
      // Fetch all 3 chunks in parallel
      const [companiesChunk, employeesChunk, servicesChunk] = await Promise.all(
        [
          actor.getCompaniesJson().catch(() => ""),
          actor.getEmployeesJson().catch(() => ""),
          actor.getServicesJson().catch(() => ""),
        ],
      );

      const companiesData = companiesChunk?.trim()
        ? safeParseJson(companiesChunk)
        : {};
      const employeesData = employeesChunk?.trim()
        ? safeParseJson(employeesChunk)
        : {};
      const servicesData = servicesChunk?.trim()
        ? safeParseJson(servicesChunk)
        : {};

      // Merge legacy format: if companiesChunk is a full ExtendedData blob, handle it
      const legacyCompanies = Array.isArray(companiesData)
        ? (companiesData as Company[])
        : (companiesData.companies as Company[]) || [];
      const legacyServiceImages =
        (companiesData.serviceImages as Record<string, string>) ||
        (servicesData.serviceImages as Record<string, string>) ||
        ({} as Record<string, string>);

      const merged: ExtendedData = {
        companies: legacyCompanies,
        employeePhotos:
          (employeesData.employeePhotos as Record<string, string>) ||
          (companiesData.employeePhotos as Record<string, string>) ||
          ({} as Record<string, string>),
        serviceImages: legacyServiceImages,
        gallery:
          (servicesData.gallery as string[]) ||
          (companiesData.gallery as string[]) ||
          [],
        vision:
          (servicesData.vision as string) ||
          (companiesData.vision as string) ||
          "",
        mission:
          (servicesData.mission as string) ||
          (companiesData.mission as string) ||
          "",
      };

      saveLocalExtendedData(merged);
      _extDataCache = merged;
      _extDataCacheTime = Date.now();
      return merged;
    }
  } catch (e) {
    console.warn("fetchExtendedData backend error", e);
  }
  const local = getLocalExtendedData();
  _extDataCache = local;
  _extDataCacheTime = Date.now();
  return local;
}

function safeParseJson(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function saveExtendedData(
  actor: backendInterface | null,
  data: ExtendedData,
): Promise<void> {
  // Invalidate cache on save
  _extDataCache = data;
  _extDataCacheTime = Date.now();
  saveLocalExtendedData(data);

  if (actor) {
    // Split into 3 smaller chunks to avoid ICP 2MB message limit
    const companiesChunk = JSON.stringify({
      companies: data.companies,
      serviceImages: data.serviceImages,
    });
    const employeesChunk = JSON.stringify({
      employeePhotos: data.employeePhotos,
    });
    const servicesChunk = JSON.stringify({
      gallery: data.gallery,
      vision: data.vision,
      mission: data.mission,
    });

    // Save all 3 in parallel, each is much smaller than the combined blob
    await Promise.all([
      actor.setCompaniesJson(companiesChunk).catch((e: unknown) => {
        console.warn("saveExtendedData companiesJson error", e);
      }),
      actor.setEmployeesJson(employeesChunk).catch((e: unknown) => {
        console.warn("saveExtendedData employeesJson error", e);
      }),
      actor.setServicesJson(servicesChunk).catch((e: unknown) => {
        console.warn("saveExtendedData servicesJson error", e);
      }),
    ]);
  }
}

// -----------------------------------------------------------------------
// Image compression helper
// -----------------------------------------------------------------------

/**
 * Compress an image data URL to reduce its size before sending to backend.
 * ICP has ~2MB message limits, so we aggressively resize to keep images small.
 */
export async function compressImage(
  dataUrl: string,
  maxSize = 300,
  quality = 0.55,
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:")) return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height, 1));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// -----------------------------------------------------------------------
// ID encoding helpers
// -----------------------------------------------------------------------

function idStringToBigInt(id: string): bigint {
  const match = id.match(/-(\d+)$/);
  if (match) return BigInt(match[1]);
  const num = Number.parseInt(id, 10);
  return Number.isNaN(num) ? BigInt(Date.now()) : BigInt(num);
}

// -----------------------------------------------------------------------
// Logo
// -----------------------------------------------------------------------

export async function fetchLogo(
  actor: backendInterface | null,
): Promise<string> {
  try {
    if (actor) {
      const logo = await actor.getLogo();
      if (logo) {
        lsSetLogo(logo);
        return logo;
      }
    }
  } catch (e) {
    console.warn("fetchLogo backend error, falling back to localStorage", e);
  }
  return getLogo();
}

export async function saveLogo(
  actor: backendInterface | null,
  dataUrl: string,
): Promise<void> {
  lsSetLogo(dataUrl);
  if (actor) {
    try {
      await actor.setLogo(dataUrl);
    } catch (e) {
      console.warn("saveLogo backend error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Banner Image
// -----------------------------------------------------------------------

export async function fetchBannerImage(
  actor: backendInterface | null,
): Promise<string> {
  try {
    if (actor) {
      const img = await actor.getBannerImage();
      if (img) {
        lsSetBannerImage(img);
        return img;
      }
    }
  } catch (e) {
    console.warn(
      "fetchBannerImage backend error, falling back to localStorage",
      e,
    );
  }
  return getBannerImage();
}

export async function saveBannerImage(
  actor: backendInterface | null,
  dataUrl: string,
): Promise<void> {
  lsSetBannerImage(dataUrl);
  if (actor) {
    try {
      await actor.setBannerImage(dataUrl);
    } catch (e) {
      console.warn("saveBannerImage backend error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------

export async function fetchServices(
  actor: backendInterface | null,
): Promise<FEService[]> {
  try {
    if (actor) {
      const [backendServices, extData] = await Promise.all([
        actor.getAllServices(),
        fetchExtendedData(actor),
      ]);
      if (backendServices.length > 0) {
        const decoded = backendServices.map((s) => ({
          id: s.id.toString(),
          name: s.name,
          description: s.description,
          price: s.price,
          icon: s.icon,
          // ExternalBlob (Uint8Array) cannot be used directly — use image map instead
          image: extData.serviceImages[s.id.toString()] || "",
          inStock: s.inStock,
          discount: Number(s.discount),
        }));
        saveServices(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchServices backend error", e);
  }
  return getServices();
}

export async function backendAddService(
  actor: backendInterface | null,
  svc: Omit<FEService, "id">,
): Promise<FEService> {
  const id = BigInt(Date.now());
  const idStr = id.toString();
  const newSvc: FEService = { ...svc, id: idStr };
  const current = getServices();
  saveServices([...current, newSvc]);

  // Compress image and store in extended data
  const compressedImage = svc.image
    ? await compressImage(svc.image, 250, 0.6)
    : "";
  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      extData.serviceImages[idStr] = compressedImage;
      await saveExtendedData(actor, extData);

      // Add service to backend (pass empty bytes for ExternalBlob field)
      await actor.addService({
        id,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        icon: svc.icon || "",
        image: {
          getBytes: async () => new Uint8Array(0),
          getDirectURL: () => "",
          withUploadProgress: () => ({
            getBytes: async () => new Uint8Array(0),
            getDirectURL: () => "",
            withUploadProgress: () => null as never,
          }),
        } as never,
        inStock: svc.inStock ?? true,
        discount: BigInt(Math.round(svc.discount || 0)),
      });
    } catch (e) {
      console.warn("backendAddService error", e);
    }
  } else {
    // No actor — just store in localStorage extended data
    const extData = getLocalExtendedData();
    extData.serviceImages[idStr] = compressedImage;
    saveLocalExtendedData(extData);
  }

  // Return with compressed image so UI shows it immediately
  return { ...newSvc, image: compressedImage };
}

export async function backendUpdateService(
  actor: backendInterface | null,
  svc: FEService,
): Promise<void> {
  const current = getServices();
  const updated = current.map((s) => (s.id === svc.id ? svc : s));
  saveServices(updated);

  const compressedImage = svc.image
    ? await compressImage(svc.image, 250, 0.6)
    : "";

  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      extData.serviceImages[svc.id] = compressedImage;
      await saveExtendedData(actor, extData);

      await actor.updateService(BigInt(svc.id), {
        id: BigInt(svc.id),
        name: svc.name,
        description: svc.description,
        price: svc.price,
        icon: svc.icon || "",
        image: {
          getBytes: async () => new Uint8Array(0),
          getDirectURL: () => "",
          withUploadProgress: () => ({
            getBytes: async () => new Uint8Array(0),
            getDirectURL: () => "",
            withUploadProgress: () => null as never,
          }),
        } as never,
        inStock: svc.inStock ?? true,
        discount: BigInt(Math.round(svc.discount || 0)),
      });
    } catch (e) {
      console.warn("backendUpdateService error", e);
    }
  } else {
    const extData = getLocalExtendedData();
    extData.serviceImages[svc.id] = compressedImage;
    saveLocalExtendedData(extData);
  }
}

export async function backendDeleteService(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  const current = getServices();
  saveServices(current.filter((s) => s.id !== id));
  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      delete extData.serviceImages[id];
      await saveExtendedData(actor, extData);
      await actor.deleteService(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteService error", e);
    }
  } else {
    const extData = getLocalExtendedData();
    delete extData.serviceImages[id];
    saveLocalExtendedData(extData);
  }
}

// -----------------------------------------------------------------------
// Employees
// -----------------------------------------------------------------------

export async function fetchEmployees(
  actor: backendInterface | null,
): Promise<FEEmployee[]> {
  try {
    if (actor) {
      const [backendEmployees, extData] = await Promise.all([
        actor.getAllEmployees(),
        fetchExtendedData(actor),
      ]);
      if (backendEmployees.length > 0) {
        const decoded = backendEmployees.map((e) => ({
          id: e.id.toString(),
          fullName: e.fullName,
          fatherName: e.fatherName,
          age: e.age.toString(),
          cnic: e.cnic,
          mobile: e.mobile,
          bloodGroup: e.bloodGroup,
          designation: e.designation,
          // ExternalBlob (Uint8Array) cannot be used directly — use photo map instead
          photo: extData.employeePhotos[e.id.toString()] || "",
        }));
        saveEmployees(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchEmployees backend error", e);
  }
  return getEmployees();
}

export async function backendAddEmployee(
  actor: backendInterface | null,
  emp: Omit<FEEmployee, "id">,
): Promise<FEEmployee> {
  const id = BigInt(Date.now());
  const idStr = id.toString();
  const newEmp: FEEmployee = { ...emp, id: idStr };
  const current = getEmployees();
  saveEmployees([...current, newEmp]);

  const compressedPhoto = emp.photo
    ? await compressImage(emp.photo, 250, 0.65)
    : "";

  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      extData.employeePhotos[idStr] = compressedPhoto;
      await saveExtendedData(actor, extData);

      await actor.addEmployee({
        id,
        fullName: emp.fullName,
        fatherName: emp.fatherName,
        age: BigInt(Number.parseInt(emp.age) || 0),
        cnic: emp.cnic,
        mobile: emp.mobile,
        bloodGroup: emp.bloodGroup,
        designation: emp.designation,
        photo: {
          getBytes: async () => new Uint8Array(0),
          getDirectURL: () => "",
          withUploadProgress: () => ({
            getBytes: async () => new Uint8Array(0),
            getDirectURL: () => "",
            withUploadProgress: () => null as never,
          }),
        } as never,
      });
    } catch (e) {
      console.warn("backendAddEmployee error", e);
    }
  } else {
    const extData = getLocalExtendedData();
    extData.employeePhotos[idStr] = compressedPhoto;
    saveLocalExtendedData(extData);
  }

  return { ...newEmp, photo: compressedPhoto };
}

export async function backendUpdateEmployee(
  actor: backendInterface | null,
  emp: FEEmployee,
): Promise<void> {
  const current = getEmployees();
  saveEmployees(current.map((e) => (e.id === emp.id ? emp : e)));

  const compressedPhoto = emp.photo
    ? await compressImage(emp.photo, 250, 0.65)
    : "";

  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      extData.employeePhotos[emp.id] = compressedPhoto;
      await saveExtendedData(actor, extData);

      await actor.updateEmployee(BigInt(emp.id), {
        id: BigInt(emp.id),
        fullName: emp.fullName,
        fatherName: emp.fatherName,
        age: BigInt(Number.parseInt(emp.age) || 0),
        cnic: emp.cnic,
        mobile: emp.mobile,
        bloodGroup: emp.bloodGroup,
        designation: emp.designation,
        photo: {
          getBytes: async () => new Uint8Array(0),
          getDirectURL: () => "",
          withUploadProgress: () => ({
            getBytes: async () => new Uint8Array(0),
            getDirectURL: () => "",
            withUploadProgress: () => null as never,
          }),
        } as never,
      });
    } catch (e) {
      console.warn("backendUpdateEmployee error", e);
    }
  } else {
    const extData = getLocalExtendedData();
    extData.employeePhotos[emp.id] = compressedPhoto;
    saveLocalExtendedData(extData);
  }
}

export async function backendDeleteEmployee(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  saveEmployees(getEmployees().filter((e) => e.id !== id));
  if (actor) {
    try {
      const extData = await fetchExtendedData(actor);
      delete extData.employeePhotos[id];
      await saveExtendedData(actor, extData);
      await actor.deleteEmployee(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteEmployee error", e);
    }
  } else {
    const extData = getLocalExtendedData();
    delete extData.employeePhotos[id];
    saveLocalExtendedData(extData);
  }
}

// -----------------------------------------------------------------------
// Reviews
// -----------------------------------------------------------------------

export async function fetchReviews(
  actor: backendInterface | null,
): Promise<FEReview[]> {
  try {
    if (actor) {
      const reviews = await actor.getAllReviews();
      if (reviews.length > 0) {
        const decoded = reviews.map((r) => ({
          id: r.id.toString(),
          customerName: r.customerName,
          review: r.review,
          rating: Number(r.rating),
          date: r.date,
          status: r.status || "approved",
        }));
        saveReviews(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchReviews backend error", e);
  }
  return getReviews();
}

export async function fetchApprovedReviews(
  actor: backendInterface | null,
): Promise<FEReview[]> {
  try {
    if (actor) {
      const reviews = await actor.getApprovedReviews();
      return reviews.map((r) => ({
        id: r.id.toString(),
        customerName: r.customerName,
        review: r.review,
        rating: Number(r.rating),
        date: r.date,
        status: "approved",
      }));
    }
  } catch (e) {
    console.warn("fetchApprovedReviews backend error", e);
  }
  return getReviews().filter((r) => !r.status || r.status === "approved");
}

export async function fetchPendingReviews(
  actor: backendInterface | null,
): Promise<FEReview[]> {
  try {
    if (actor) {
      const reviews = await actor.getPendingReviews();
      return reviews.map((r) => ({
        id: r.id.toString(),
        customerName: r.customerName,
        review: r.review,
        rating: Number(r.rating),
        date: r.date,
        status: "pending",
      }));
    }
  } catch (e) {
    console.warn("fetchPendingReviews backend error", e);
  }
  return getReviews().filter((r) => r.status === "pending");
}

export async function backendAddReview(
  actor: backendInterface | null,
  review: Omit<FEReview, "id" | "date">,
): Promise<FEReview> {
  const id = BigInt(Date.now());
  const date = new Date().toLocaleDateString();
  const newReview: FEReview = {
    id: id.toString(),
    customerName: review.customerName,
    review: review.review,
    rating: review.rating,
    date,
    status: review.status || "approved",
  };
  if (actor) {
    try {
      await actor.addReview({
        id,
        customerName: review.customerName,
        review: review.review,
        rating: BigInt(review.rating),
        date,
        status: review.status || "approved",
      });
    } catch (e) {
      console.warn("backendAddReview error", e);
    }
  }
  return newReview;
}

export async function backendUpdateReview(
  actor: backendInterface | null,
  review: FEReview,
): Promise<void> {
  const reviews = getReviews();
  const updated = reviews.map((r) => (r.id === review.id ? review : r));
  saveReviews(updated);
  if (actor) {
    try {
      await actor.updateReview(BigInt(review.id), {
        id: BigInt(review.id),
        customerName: review.customerName,
        review: review.review,
        rating: BigInt(review.rating),
        date: review.date,
        status: review.status || "approved",
      });
    } catch (e) {
      console.warn("backendUpdateReview error", e);
    }
  }
}

export async function backendDeleteReview(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  if (actor) {
    try {
      await actor.deleteReview(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteReview error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Invoices
// -----------------------------------------------------------------------

export async function fetchInvoices(
  actor: backendInterface | null,
): Promise<FEInvoice[]> {
  try {
    if (actor) {
      const backendInvoices = await actor.getAllInvoices();
      if (backendInvoices.length > 0) {
        const lsInvoices = getInvoices();
        const merged = backendInvoices.map((bi) => {
          const lsMatch = lsInvoices.find(
            (li) =>
              li.id === `INV-${bi.id.toString()}` || li.id === bi.id.toString(),
          );
          if (lsMatch) return lsMatch;
          return {
            id: `INV-${bi.id.toString()}`,
            userId: `CUST-${bi.id.toString()}`,
            customerName: bi.customerName,
            phone: bi.phone || "",
            address: bi.address || "",
            date: bi.date,
            items: bi.items.map((item, idx) => ({
              srNo: Number(item.srNo) || idx + 1,
              particular: item.particular,
              quantity: Number(item.quantity) || 1,
              quality: item.quality || "",
              rate: Number(item.rate) || 0,
              total: Number(item.total) || 0,
              billingItemId: Number(item.billingItemId) || 0,
            })),
            grandTotal: Number(bi.grandTotal),
            advance: Number(bi.advance),
            balance: Number(bi.balance),
            discount: Number(bi.discount),
            terms: "",
          } as FEInvoice;
        });
        for (const lsInv of lsInvoices) {
          if (!merged.find((m) => m.id === lsInv.id)) {
            merged.push(lsInv);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.warn("fetchInvoices backend error", e);
  }
  return getInvoices();
}

export async function backendAddInvoice(
  actor: backendInterface | null,
  invoice: FEInvoice,
): Promise<void> {
  lsAddInvoice(invoice);
  if (actor) {
    try {
      await actor.addInvoice({
        id: idStringToBigInt(invoice.id),
        customerName: invoice.customerName,
        phone: invoice.phone,
        address: invoice.address,
        date: invoice.date,
        items: invoice.items.map((item) => ({
          srNo: BigInt(item.srNo),
          particular: item.particular,
          quantity: String(item.quantity),
          quality: item.quality,
          rate: BigInt(Math.round(item.rate)),
          total: BigInt(Math.round(item.total)),
          billingItemId: BigInt(item.billingItemId || 0),
        })),
        grandTotal: BigInt(Math.round(invoice.grandTotal)),
        advance: BigInt(Math.round(invoice.advance)),
        balance: BigInt(Math.round(invoice.balance)),
        discount: BigInt(Math.round(invoice.discount)),
      });
    } catch (e) {
      console.warn("backendAddInvoice error", e);
    }
  }
}

export async function backendUpdateInvoice(
  actor: backendInterface | null,
  invoice: FEInvoice,
): Promise<void> {
  lsUpdateInvoice(invoice);
  if (actor) {
    try {
      const id = idStringToBigInt(invoice.id);
      await actor.updateInvoice(id, {
        id,
        customerName: invoice.customerName,
        phone: invoice.phone,
        address: invoice.address,
        date: invoice.date,
        items: invoice.items.map((item) => ({
          srNo: BigInt(item.srNo),
          particular: item.particular,
          quantity: String(item.quantity),
          quality: item.quality,
          rate: BigInt(Math.round(item.rate)),
          total: BigInt(Math.round(item.total)),
          billingItemId: BigInt(item.billingItemId || 0),
        })),
        grandTotal: BigInt(Math.round(invoice.grandTotal)),
        advance: BigInt(Math.round(invoice.advance)),
        balance: BigInt(Math.round(invoice.balance)),
        discount: BigInt(Math.round(invoice.discount)),
      });
    } catch (e) {
      console.warn("backendUpdateInvoice error", e);
    }
  }
}

export async function backendDeleteInvoice(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  lsDeleteInvoice(id);
  if (actor) {
    try {
      await actor.deleteInvoice(idStringToBigInt(id));
    } catch (e) {
      console.warn("backendDeleteInvoice error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Customer Orders
// -----------------------------------------------------------------------

export async function fetchOrders(
  actor: backendInterface | null,
): Promise<FEOrder[]> {
  try {
    if (actor) {
      const backendOrders = await actor.getAllCustomerOrders();
      if (backendOrders.length > 0) {
        const decoded = backendOrders.map((o) => ({
          id: o.id.toString(),
          serviceId: o.serviceId,
          serviceName: o.serviceName,
          customerName: o.customerName,
          phone: o.phone,
          quantity: Number(o.quantity),
          notes: o.notes,
          totalPrice: Number(o.totalPrice),
          date: o.date,
          status: o.status || "pending",
          customerId:
            o.customerId != null ? o.customerId.toString() : undefined,
        })) as FEOrder[];
        saveOrders(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchOrders backend error", e);
  }
  return getOrders();
}

export async function backendAddOrder(
  actor: backendInterface | null,
  order: Omit<FEOrder, "id" | "date">,
): Promise<FEOrder> {
  const newOrder = lsAddOrder(order);
  if (actor) {
    try {
      await actor.addCustomerOrder({
        id: BigInt(newOrder.id),
        serviceId: newOrder.serviceId,
        serviceName: newOrder.serviceName,
        customerName: newOrder.customerName,
        phone: newOrder.phone,
        quantity: BigInt(newOrder.quantity),
        notes: newOrder.notes,
        totalPrice: BigInt(Math.round(newOrder.totalPrice)),
        date: newOrder.date,
        status: newOrder.status,
        customerId: newOrder.customerId
          ? BigInt(newOrder.customerId)
          : undefined,
      });
    } catch (e) {
      console.warn("backendAddOrder error", e);
    }
  }
  return newOrder;
}

export async function backendDeleteOrder(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  lsDeleteOrder(id);
  if (actor) {
    try {
      await actor.deleteCustomerOrder(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteOrder error", e);
    }
  }
}

export async function backendUpdateOrder(
  actor: backendInterface | null,
  order: FEOrder,
): Promise<void> {
  lsUpdateOrder(order);
  if (actor) {
    try {
      await actor.updateCustomerOrder(BigInt(order.id), {
        id: BigInt(order.id),
        serviceId: order.serviceId,
        serviceName: order.serviceName,
        customerName: order.customerName,
        phone: order.phone,
        quantity: BigInt(order.quantity),
        notes: order.notes,
        totalPrice: BigInt(Math.round(order.totalPrice)),
        date: order.date,
        status: order.status,
        customerId: order.customerId ? BigInt(order.customerId) : undefined,
      });
    } catch (e) {
      console.warn("backendUpdateOrder error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Contact Messages
// -----------------------------------------------------------------------

export async function fetchContactMessages(
  actor: backendInterface | null,
): Promise<FEContactMessage[]> {
  try {
    if (actor) {
      const msgs = await actor.getAllContactMessages();
      if (msgs.length > 0) {
        const decoded = msgs.map((m) => ({
          id: m.id.toString(),
          name: m.name,
          phone: m.phone,
          message: m.message,
          date: m.date,
          isRead: m.isRead,
        }));
        saveContactMessages(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchContactMessages backend error", e);
  }
  return getContactMessages();
}

export async function backendAddContactMessage(
  actor: backendInterface | null,
  msg: Pick<FEContactMessage, "name" | "phone" | "message">,
): Promise<void> {
  if (actor) {
    try {
      const id = BigInt(Date.now());
      await actor.addContactMessage({
        id,
        name: msg.name,
        phone: msg.phone,
        message: msg.message,
        date: new Date().toLocaleDateString(),
        isRead: false,
      });
    } catch (e) {
      console.warn("backendAddContactMessage error", e);
    }
  }
}

export async function backendMarkMessageRead(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  const msgs = getContactMessages().map((m) =>
    m.id === id ? { ...m, isRead: true } : m,
  );
  saveContactMessages(msgs);
  if (actor) {
    try {
      await actor.markContactMessageRead(BigInt(id));
    } catch (e) {
      console.warn("backendMarkMessageRead error", e);
    }
  }
}

export async function backendDeleteContactMessage(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  const msgs = getContactMessages().filter((m) => m.id !== id);
  saveContactMessages(msgs);
  if (actor) {
    try {
      await actor.deleteContactMessage(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteContactMessage error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Billing Items
// -----------------------------------------------------------------------

export async function fetchBillingItems(
  actor: backendInterface | null,
): Promise<FEBillingItem[]> {
  try {
    if (actor) {
      const items = await actor.getAllBillingItems();
      if (items.length > 0) {
        const decoded = items.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          sellingPrice: Number(item.sellingPrice),
          purchasePrice: Number(item.purchasePrice),
          category: item.category,
        }));
        saveBillingItems(decoded);
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchBillingItems backend error", e);
  }
  return getBillingItems();
}

export async function backendAddBillingItem(
  actor: backendInterface | null,
  item: Omit<FEBillingItem, "id">,
): Promise<FEBillingItem> {
  const newItem = addBillingItemToStorage(item);
  if (actor) {
    try {
      await actor.addBillingItem({
        id: BigInt(newItem.id),
        name: newItem.name,
        sellingPrice: BigInt(Math.round(newItem.sellingPrice)),
        purchasePrice: BigInt(Math.round(newItem.purchasePrice)),
        category: newItem.category,
      });
    } catch (e) {
      console.warn("backendAddBillingItem error", e);
    }
  }
  return newItem;
}

export async function backendUpdateBillingItem(
  actor: backendInterface | null,
  item: FEBillingItem,
): Promise<void> {
  updateBillingItemInStorage(item);
  if (actor) {
    try {
      await actor.updateBillingItem(BigInt(item.id), {
        id: BigInt(item.id),
        name: item.name,
        sellingPrice: BigInt(Math.round(item.sellingPrice)),
        purchasePrice: BigInt(Math.round(item.purchasePrice)),
        category: item.category,
      });
    } catch (e) {
      console.warn("backendUpdateBillingItem error", e);
    }
  }
}

export async function backendDeleteBillingItem(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  deleteBillingItemFromStorage(id);
  if (actor) {
    try {
      await actor.deleteBillingItem(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteBillingItem error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Companies
// -----------------------------------------------------------------------

export async function fetchCompanies(
  actor: backendInterface | null,
): Promise<Company[]> {
  const extData = await fetchExtendedData(actor);
  return extData.companies;
}

export async function saveCompanies(
  actor: backendInterface | null,
  companies: Company[],
): Promise<void> {
  if (actor) {
    const extData = await fetchExtendedData(actor);
    extData.companies = companies;
    await saveExtendedData(actor, extData);
  } else {
    const extData = getLocalExtendedData();
    extData.companies = companies;
    saveLocalExtendedData(extData);
  }
}

// -----------------------------------------------------------------------
// Gallery
// -----------------------------------------------------------------------

export async function fetchGallery(
  actor: backendInterface | null,
): Promise<string[]> {
  const extData = await fetchExtendedData(actor);
  return extData.gallery;
}

export async function saveGallery(
  actor: backendInterface | null,
  images: string[],
): Promise<void> {
  if (actor) {
    const extData = await fetchExtendedData(actor);
    extData.gallery = images;
    await saveExtendedData(actor, extData);
  } else {
    const extData = getLocalExtendedData();
    extData.gallery = images;
    saveLocalExtendedData(extData);
  }
}

// -----------------------------------------------------------------------
// Vision & Mission
// -----------------------------------------------------------------------

export async function fetchVisionMission(
  actor: backendInterface | null,
): Promise<{ vision: string; mission: string }> {
  const extData = await fetchExtendedData(actor);
  return { vision: extData.vision, mission: extData.mission };
}

export async function saveVisionMission(
  actor: backendInterface | null,
  vision: string,
  mission: string,
): Promise<void> {
  if (actor) {
    const extData = await fetchExtendedData(actor);
    extData.vision = vision;
    extData.mission = mission;
    await saveExtendedData(actor, extData);
  } else {
    const extData = getLocalExtendedData();
    extData.vision = vision;
    extData.mission = mission;
    saveLocalExtendedData(extData);
  }
}

// -----------------------------------------------------------------------
// Billing Customers (with address)
// -----------------------------------------------------------------------

export async function fetchBillingCustomers(
  actor: backendInterface | null,
): Promise<FEBillingCustomer[]> {
  try {
    if (actor) {
      const customers = await actor.getAllBillingCustomers();
      if (customers.length > 0) {
        const decoded = customers.map((c) => ({
          id: c.id.toString(),
          name: c.name,
          phone: c.phone,
          address: c.address,
        }));
        localStorage.setItem("idpc_billing_customers", JSON.stringify(decoded));
        return decoded;
      }
    }
  } catch (e) {
    console.warn("fetchBillingCustomers backend error", e);
  }
  const data = localStorage.getItem("idpc_billing_customers");
  if (!data) return [];
  const parsed: FEBillingCustomer[] = JSON.parse(data);
  return parsed.map((c) => ({ ...c, address: c.address ?? "" }));
}

export async function backendAddBillingCustomer(
  actor: backendInterface | null,
  customer: Omit<FEBillingCustomer, "id">,
): Promise<FEBillingCustomer> {
  const id = BigInt(Date.now());
  const newCustomer: FEBillingCustomer = { id: id.toString(), ...customer };
  const existing: FEBillingCustomer[] = JSON.parse(
    localStorage.getItem("idpc_billing_customers") || "[]",
  );
  const dedup = existing.find(
    (c) => c.name.toLowerCase() === customer.name.toLowerCase(),
  );
  if (!dedup) {
    existing.push(newCustomer);
    localStorage.setItem("idpc_billing_customers", JSON.stringify(existing));
  }
  if (actor) {
    try {
      await actor.addBillingCustomer({
        id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
    } catch (e) {
      console.warn("backendAddBillingCustomer error", e);
    }
  }
  return dedup || newCustomer;
}

export async function backendDeleteBillingCustomer(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  const existing: FEBillingCustomer[] = JSON.parse(
    localStorage.getItem("idpc_billing_customers") || "[]",
  );
  localStorage.setItem(
    "idpc_billing_customers",
    JSON.stringify(existing.filter((c) => c.id !== id)),
  );
  if (actor) {
    try {
      await actor.deleteBillingCustomer(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteBillingCustomer error", e);
    }
  }
}

export async function backendUpdateBillingCustomer(
  actor: backendInterface | null,
  customer: FEBillingCustomer,
): Promise<void> {
  const existing: FEBillingCustomer[] = JSON.parse(
    localStorage.getItem("idpc_billing_customers") || "[]",
  );
  localStorage.setItem(
    "idpc_billing_customers",
    JSON.stringify(existing.map((c) => (c.id === customer.id ? customer : c))),
  );
  if (actor) {
    try {
      await actor.updateBillingCustomer(BigInt(customer.id), {
        id: BigInt(customer.id),
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
    } catch (e) {
      console.warn("backendUpdateBillingCustomer error", e);
    }
  }
}

// -----------------------------------------------------------------------
// About Stats
// -----------------------------------------------------------------------

export async function fetchAboutStats(
  actor: backendInterface | null,
): Promise<{ yearsExperience: string; numClients: string }> {
  try {
    if (actor) {
      const stats = await actor.getAboutStats();
      if (stats) {
        localStorage.setItem("idpc_years_experience", stats.experience);
        localStorage.setItem("idpc_num_clients", stats.clientsCount);
        return {
          yearsExperience: stats.experience,
          numClients: stats.clientsCount,
        };
      }
    }
  } catch (e) {
    console.warn("fetchAboutStats backend error", e);
  }
  return {
    yearsExperience: localStorage.getItem("idpc_years_experience") || "10+",
    numClients: localStorage.getItem("idpc_num_clients") || "1000+",
  };
}

export async function saveAboutStats(
  actor: backendInterface | null,
  experience: string,
  clientsCount: string,
): Promise<void> {
  localStorage.setItem("idpc_years_experience", experience);
  localStorage.setItem("idpc_num_clients", clientsCount);
  if (actor) {
    try {
      await actor.setAboutStats({ experience, clientsCount });
    } catch (e) {
      console.warn("saveAboutStats backend error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Customers
// -----------------------------------------------------------------------

export async function registerCustomerAccount(
  actor: backendInterface | null,
  customer: CustomerAccount,
): Promise<void> {
  if (actor) {
    try {
      await actor.registerCustomer(customer);
    } catch (e) {
      console.warn("registerCustomerAccount error", e);
      throw e;
    }
  }
}

export async function fetchCustomers(
  actor: backendInterface | null,
): Promise<CustomerAccount[]> {
  try {
    if (actor) {
      const customers = await actor.getAllCustomers();
      return customers;
    }
  } catch (e) {
    console.warn("fetchCustomers backend error", e);
  }
  return [];
}

export async function fetchCustomerOrders(
  actor: backendInterface | null,
  customerId: bigint,
  phone?: string,
): Promise<CustomerOrder[]> {
  try {
    if (actor) {
      // Get orders by customerId
      const byId = await actor.getOrdersByCustomer(customerId).catch(() => []);
      // Also get all orders and filter by phone as fallback (for old orders without customerId)
      if (phone) {
        const allOrders = await actor.getAllCustomerOrders().catch(() => []);
        const byPhone = allOrders.filter((o) => o.phone === phone);
        // Merge: byId + any byPhone not already in byId
        const idSet = new Set(byId.map((o) => o.id.toString()));
        const merged = [
          ...byId,
          ...byPhone.filter((o) => !idSet.has(o.id.toString())),
        ];
        return merged;
      }
      return byId;
    }
  } catch (e) {
    console.warn("fetchCustomerOrders backend error", e);
  }
  return [];
}

export async function fetchCustomerInvoices(
  actor: backendInterface | null,
  phone: string,
): Promise<BackendInvoice[]> {
  try {
    if (actor) {
      return await actor.getInvoicesByCustomerPhone(phone);
    }
  } catch (e) {
    console.warn("fetchCustomerInvoices backend error", e);
  }
  return [];
}

export async function fetchSecurityAnswers(
  actor: backendInterface | null,
): Promise<SecurityAnswers | null> {
  try {
    if (actor) {
      return await actor.getSecurityAnswers();
    }
  } catch (e) {
    console.warn("fetchSecurityAnswers backend error", e);
  }
  return null;
}

export async function saveSecurityAnswers(
  actor: backendInterface | null,
  answers: SecurityAnswers,
): Promise<void> {
  if (actor) {
    try {
      await actor.setSecurityAnswers(answers);
    } catch (e) {
      console.warn("saveSecurityAnswers error", e);
    }
  }
}

export async function updateCustomerLastLoginTime(
  actor: backendInterface | null,
  id: bigint,
): Promise<void> {
  if (actor) {
    try {
      await actor.updateCustomerLastLogin(id);
    } catch (e) {
      console.warn("updateCustomerLastLogin error", e);
    }
  }
}
