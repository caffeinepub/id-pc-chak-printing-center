// Storage helpers for ID&PC Chak website
// All data stored in localStorage

export interface InvoiceItem {
  srNo: number;
  particular: string;
  quantity: number;
  quality: string;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. "INV-001"
  userId: string; // customer user ID
  customerName: string;
  phone: string;
  address: string;
  date: string;
  items: InvoiceItem[];
  grandTotal: number;
  advance: number;
  balance: number;
  terms: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: string;
}

export interface Review {
  id: string;
  customerName: string;
  review: string;
  rating: number; // 1-5
  date: string;
}

const KEYS = {
  invoices: "idpc_invoices",
  adminPassword: "idpc_admin_password",
  messages: "idpc_messages",
  reviews: "idpc_reviews",
};

// Initialize admin password on first load
export function initStorage() {
  if (!localStorage.getItem(KEYS.adminPassword)) {
    localStorage.setItem(KEYS.adminPassword, "kamii911");
  }
  if (!localStorage.getItem(KEYS.invoices)) {
    localStorage.setItem(KEYS.invoices, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.reviews)) {
    localStorage.setItem(KEYS.reviews, JSON.stringify([]));
  }
}

// Get admin password
export function getAdminPassword(): string {
  return localStorage.getItem(KEYS.adminPassword) || "kamii911";
}

// Set admin password
export function setAdminPassword(password: string) {
  localStorage.setItem(KEYS.adminPassword, password);
}

// Get all invoices
export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(KEYS.invoices);
  return data ? JSON.parse(data) : [];
}

// Save invoices array
export function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(KEYS.invoices, JSON.stringify(invoices));
}

// Add a new invoice
export function addInvoice(invoice: Invoice) {
  const invoices = getInvoices();
  invoices.push(invoice);
  saveInvoices(invoices);
}

// Delete an invoice by ID
export function deleteInvoice(invoiceId: string) {
  const invoices = getInvoices();
  saveInvoices(invoices.filter((inv) => inv.id !== invoiceId));
}

// Update an existing invoice
export function updateInvoice(updated: Invoice) {
  const invoices = getInvoices();
  saveInvoices(invoices.map((inv) => (inv.id === updated.id ? updated : inv)));
}

// Find invoice by userId + invoiceId
export function findInvoice(userId: string, invoiceId: string): Invoice | null {
  const invoices = getInvoices();
  return (
    invoices.find(
      (inv) =>
        inv.userId.toLowerCase() === userId.toLowerCase() &&
        inv.id.toLowerCase() === invoiceId.toLowerCase(),
    ) || null
  );
}

// Get next invoice number
export function getNextInvoiceNumber(): string {
  const invoices = getInvoices();
  const num = invoices.length + 1;
  return `INV-${String(num).padStart(3, "0")}`;
}

// Save contact message
export function saveMessage(msg: Omit<ContactMessage, "id" | "date">) {
  const messages: ContactMessage[] = JSON.parse(
    localStorage.getItem(KEYS.messages) || "[]",
  );
  messages.push({
    ...msg,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
  });
  localStorage.setItem(KEYS.messages, JSON.stringify(messages));
}

// ---- Reviews ----

export function getReviews(): Review[] {
  const data = localStorage.getItem(KEYS.reviews);
  return data ? JSON.parse(data) : [];
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(KEYS.reviews, JSON.stringify(reviews));
}

export function addReview(review: Omit<Review, "id" | "date">) {
  const reviews = getReviews();
  reviews.push({
    ...review,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
  });
  saveReviews(reviews);
}

export function deleteReview(reviewId: string) {
  saveReviews(getReviews().filter((r) => r.id !== reviewId));
}
