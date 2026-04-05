/**
 * backendData.ts
 * Async functions for reading/writing data via the ICP backend canister.
 * Falls back to localStorage if backend is unavailable.
 * All data written to backend is also cached in localStorage.
 */

import {
  type Invoice as BackendInvoice,
  type CustomerAccount,
  type CustomerOrder,
  ExternalBlob,
  type SecurityAnswers,
  type backendInterface,
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
// ID encoding helpers
// -----------------------------------------------------------------------

function idStringToBigInt(id: string): bigint {
  const match = id.match(/-(\d+)$/);
  if (match) return BigInt(match[1]);
  const num = Number.parseInt(id, 10);
  return Number.isNaN(num) ? BigInt(Date.now()) : BigInt(num);
}

/** Create a placeholder ExternalBlob for backend fields we don't need to sync */
function emptyBlob(): ExternalBlob {
  return ExternalBlob.fromURL("");
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
      const svcs = await actor.getAllServices();
      if (svcs.length > 0) {
        const lsServices = getServices();
        const merged = svcs.map((svc) => {
          const lsMatch = lsServices.find((ls) => ls.id === svc.id.toString());
          return {
            id: svc.id.toString(),
            icon: svc.icon,
            name: svc.name,
            description: svc.description,
            price: svc.price || "Contact for pricing",
            image: lsMatch?.image || svc.image.getDirectURL() || "",
            inStock: svc.inStock ?? true,
            discount: Number(svc.discount ?? 0n),
          } as FEService;
        });
        saveServices(merged);
        return merged;
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
  const newSvc: FEService = { ...svc, id: id.toString() };
  if (actor) {
    try {
      await actor.addService({
        id,
        icon: svc.icon,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        image: emptyBlob(),
        inStock: svc.inStock ?? true,
        discount: BigInt(svc.discount ?? 0),
      });
    } catch (e) {
      console.warn("backendAddService error", e);
    }
  }
  return newSvc;
}

export async function backendUpdateService(
  actor: backendInterface | null,
  svc: FEService,
): Promise<void> {
  if (actor) {
    try {
      await actor.updateService(BigInt(svc.id), {
        id: BigInt(svc.id),
        icon: svc.icon,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        image: emptyBlob(),
        inStock: svc.inStock ?? true,
        discount: BigInt(svc.discount ?? 0),
      });
    } catch (e) {
      console.warn("backendUpdateService error", e);
    }
  }
}

export async function backendDeleteService(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  if (actor) {
    try {
      await actor.deleteService(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteService error", e);
    }
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
      const emps = await actor.getAllEmployees();
      if (emps.length > 0) {
        const lsEmployees = getEmployees();
        const merged = emps.map((emp) => {
          const lsMatch = lsEmployees.find((ls) => ls.id === emp.id.toString());
          return {
            id: emp.id.toString(),
            fullName: emp.fullName,
            fatherName: emp.fatherName,
            age: String(emp.age),
            cnic: emp.cnic,
            mobile: emp.mobile,
            bloodGroup: emp.bloodGroup,
            photo: lsMatch?.photo || emp.photo.getDirectURL() || "",
            designation: emp.designation,
          } as FEEmployee;
        });
        // Also merge LS employees not in backend
        for (const lsEmp of lsEmployees) {
          if (!merged.find((m) => m.id === lsEmp.id)) merged.push(lsEmp);
        }
        saveEmployees(merged);
        return merged;
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
  const newEmp: FEEmployee = { ...emp, id: id.toString() };
  if (actor) {
    try {
      await actor.addEmployee({
        id,
        fullName: emp.fullName,
        fatherName: emp.fatherName,
        age: BigInt(Number(emp.age) || 0),
        cnic: emp.cnic,
        mobile: emp.mobile,
        bloodGroup: emp.bloodGroup,
        photo: emptyBlob(),
        designation: emp.designation,
      });
    } catch (e) {
      console.warn("backendAddEmployee error", e);
    }
  }
  return newEmp;
}

export async function backendUpdateEmployee(
  actor: backendInterface | null,
  emp: FEEmployee,
): Promise<void> {
  if (actor) {
    try {
      await actor.updateEmployee(BigInt(emp.id), {
        id: BigInt(emp.id),
        fullName: emp.fullName,
        fatherName: emp.fatherName,
        age: BigInt(Number(emp.age) || 0),
        cnic: emp.cnic,
        mobile: emp.mobile,
        bloodGroup: emp.bloodGroup,
        photo: emptyBlob(),
        designation: emp.designation,
      });
    } catch (e) {
      console.warn("backendUpdateEmployee error", e);
    }
  }
}

export async function backendDeleteEmployee(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  if (actor) {
    try {
      await actor.deleteEmployee(BigInt(id));
    } catch (e) {
      console.warn("backendDeleteEmployee error", e);
    }
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
  // Fallback: filter LS reviews that are approved or have no status
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
  // Update LS
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
        // Merge backend IDs with LS full data
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
        // Also include LS invoices not in backend
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
  try {
    if (actor) {
      const json = await actor.getCompaniesJson();
      if (json) {
        const companies = JSON.parse(json) as Company[];
        localStorage.setItem("idpc_companies", json);
        return companies;
      }
    }
  } catch (e) {
    console.warn("fetchCompanies backend error", e);
  }
  const data = localStorage.getItem("idpc_companies");
  return data ? JSON.parse(data) : [];
}

export async function saveCompanies(
  actor: backendInterface | null,
  companies: Company[],
): Promise<void> {
  const json = JSON.stringify(companies);
  localStorage.setItem("idpc_companies", json);
  if (actor) {
    try {
      await actor.setCompaniesJson(json);
    } catch (e) {
      console.warn("saveCompanies backend error", e);
    }
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
  // Ensure address field exists for legacy data
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
): Promise<CustomerOrder[]> {
  try {
    if (actor) {
      return await actor.getOrdersByCustomer(customerId);
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
