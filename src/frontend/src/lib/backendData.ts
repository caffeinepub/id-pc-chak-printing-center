/**
 * backendData.ts
 * Async functions for reading/writing data via the ICP backend canister.
 * Falls back to localStorage if backend is unavailable.
 * All data written to backend is also cached in localStorage.
 *
 * NOTE: The backend types differ significantly from the frontend types.
 * Complex types (invoices with full items, employees with custom fields)
 * are stored primarily in localStorage. The backend is used as a secondary
 * sync store where possible.
 */

import { ExternalBlob, type backendInterface } from "@/backend";
import {
  type ContactMessage as FEContactMessage,
  type Employee as FEEmployee,
  type Invoice as FEInvoice,
  type CustomerOrder as FEOrder,
  type Review as FEReview,
  type Service as FEService,
  getBannerImage,
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
  saveContactMessages,
  saveOrders,
  saveReviews,
  saveServices,
} from "./storage";

// Re-export frontend types for convenience
export type {
  FEContactMessage as ContactMessage,
  FEEmployee as Employee,
  FEOrder as Order,
  FEReview as Review,
  FEService as Service,
};

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
// The backend stores banner as ExternalBlob; we use localStorage for string URLs.
// -----------------------------------------------------------------------

export async function fetchBannerImage(
  actor: backendInterface | null,
): Promise<string> {
  try {
    if (actor) {
      const banner = await actor.getBannerImage();
      if (banner) {
        const url = banner.getDirectURL();
        if (url) {
          lsSetBannerImage(url);
          return url;
        }
      }
    }
  } catch (e) {
    console.warn("fetchBannerImage backend error", e);
  }
  return getBannerImage();
}

export async function saveBannerImage(
  actor: backendInterface | null,
  dataUrl: string,
): Promise<void> {
  // Store in localStorage immediately for fast retrieval
  lsSetBannerImage(dataUrl);
  // Upload to backend as ExternalBlob
  if (actor) {
    try {
      const blob = ExternalBlob.fromURL(dataUrl);
      await actor.setBannerImage(blob);
    } catch (e) {
      console.warn("saveBannerImage backend error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Services
// Backend Service.image is ExternalBlob; frontend Service.image is a string.
// We store in LS as source of truth and sync basic metadata to backend.
// -----------------------------------------------------------------------

export async function fetchServices(
  actor: backendInterface | null,
): Promise<FEService[]> {
  try {
    if (actor) {
      const svcs = await actor.getAllServices();
      if (svcs.length > 0) {
        // Merge backend data with LS (to preserve image field stored in LS)
        const lsServices = getServices();
        const merged = svcs.map((svc) => {
          const lsMatch = lsServices.find((ls) => ls.id === svc.id.toString());
          return {
            id: svc.id.toString(),
            icon: svc.icon,
            name: svc.name,
            description: svc.description,
            price: svc.price || "Contact for pricing",
            // Prefer LS image (base64) over backend blob URL
            image: lsMatch?.image || svc.image.getDirectURL() || "",
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
      await actor.createService({
        id,
        icon: svc.icon,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        image: emptyBlob(),
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
// Backend Employee type has different fields (salary, jobTitle, department).
// We use localStorage as the primary source for the full employee record.
// -----------------------------------------------------------------------

export async function fetchEmployees(
  _actor: backendInterface | null,
): Promise<FEEmployee[]> {
  // Backend employee type is incompatible with FEEmployee - use LS only
  return getEmployees();
}

export async function backendAddEmployee(
  _actor: backendInterface | null,
  emp: Omit<FEEmployee, "id">,
): Promise<FEEmployee> {
  const id = BigInt(Date.now());
  const newEmp: FEEmployee = { ...emp, id: id.toString() };
  // Employee model mismatch - LS only
  return newEmp;
}

export async function backendUpdateEmployee(
  _actor: backendInterface | null,
  _emp: FEEmployee,
): Promise<void> {
  // Employee model mismatch - LS only
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
  };
  if (actor) {
    try {
      await actor.createReview({
        id,
        customerName: review.customerName,
        review: review.review,
        rating: BigInt(review.rating),
        date,
      });
    } catch (e) {
      console.warn("backendAddReview error", e);
    }
  }
  return newReview;
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
// Backend Invoice: { id, customerName, date, totalAmount, items: [string, bigint][] }
// Full invoice (with items detail, discount, etc.) lives in localStorage.
// -----------------------------------------------------------------------

export async function fetchInvoices(
  _actor: backendInterface | null,
): Promise<FEInvoice[]> {
  // Backend invoice type doesn't match FEInvoice - use localStorage as primary
  return getInvoices();
}

export async function backendAddInvoice(
  actor: backendInterface | null,
  invoice: FEInvoice,
): Promise<void> {
  // Always save to localStorage first (primary store)
  lsAddInvoice(invoice);
  if (actor) {
    try {
      await actor.createInvoice({
        id: idStringToBigInt(invoice.id),
        customerName: invoice.customerName,
        date: invoice.date,
        totalAmount: BigInt(Math.round(invoice.grandTotal)),
        items: invoice.items.map(
          (item) =>
            [item.particular, BigInt(Math.round(item.total))] as [
              string,
              bigint,
            ],
        ),
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
        date: invoice.date,
        totalAmount: BigInt(Math.round(invoice.grandTotal)),
        items: invoice.items.map(
          (item) =>
            [item.particular, BigInt(Math.round(item.total))] as [
              string,
              bigint,
            ],
        ),
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
// Backend CustomerOrder: { id, customerName, date, invoiceId, isPaid,
//   orderType, orderedItems, amountPaid }
// We map our richer FEOrder to/from this structure.
// -----------------------------------------------------------------------

function encodeOrder(order: FEOrder) {
  const id =
    order.id && order.id !== "" ? BigInt(order.id) : BigInt(Date.now());
  return {
    id,
    customerName: `${order.customerName} | ${order.phone}`,
    date: order.date,
    invoiceId: 0n,
    isPaid: order.status === "completed",
    orderType: order.serviceName,
    orderedItems: [[order.serviceName, BigInt(order.quantity)]] as Array<
      [string, bigint]
    >,
    amountPaid: BigInt(Math.round(order.totalPrice)),
  };
}

export async function fetchOrders(
  actor: backendInterface | null,
): Promise<FEOrder[]> {
  try {
    if (actor) {
      const backendOrders = await actor.getAllCustomerOrders();
      if (backendOrders.length > 0) {
        const decoded = backendOrders.map((o) => {
          const parts = o.customerName.split(" | ");
          const customerName = parts[0] || o.customerName;
          const phone = parts[1] || "";
          const qty = o.orderedItems[0]?.[1] ?? 1n;
          return {
            id: o.id.toString(),
            serviceId: o.orderType,
            serviceName: o.orderType,
            customerName,
            phone,
            quantity: Number(qty),
            notes: "",
            totalPrice: Number(o.amountPaid),
            date: o.date,
            status: o.isPaid ? "completed" : "pending",
          } as FEOrder;
        });
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
      await actor.createCustomerOrder(encodeOrder(newOrder));
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
      await actor.updateCustomerOrder(BigInt(order.id), encodeOrder(order));
    } catch (e) {
      console.warn("backendUpdateOrder error", e);
    }
  }
}

// -----------------------------------------------------------------------
// Contact Messages
// Backend ContactMessage: { id, name, phone, message, date, isRead } - matches!
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
      await actor.createContactMessage({
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
  // Update localStorage immediately
  const msgs = getContactMessages().map((m) =>
    m.id === id ? { ...m, isRead: true } : m,
  );
  saveContactMessages(msgs);
  if (actor) {
    try {
      const existing = msgs.find((m) => m.id === id);
      if (existing) {
        await actor.updateContactMessage(BigInt(id), {
          id: BigInt(id),
          name: existing.name,
          phone: existing.phone,
          message: existing.message,
          date: existing.date,
          isRead: true,
        });
      }
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
