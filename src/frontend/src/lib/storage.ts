// Storage helpers for ID&PC Chak website
// All data stored in localStorage

export interface InvoiceItem {
  srNo: number;
  particular: string;
  quantity: number;
  quality: string;
  rate: number;
  total: number;
  billingItemId?: number;
}

export interface Invoice {
  id: string; // e.g. "INV-1234567890"
  userId: string; // customer user ID
  customerName: string;
  phone: string;
  address: string;
  date: string;
  items: InvoiceItem[];
  grandTotal: number;
  advance: number;
  balance: number;
  discount: number;
  terms: string;
  paymentStatus?: "unpaid" | "partial" | "paid";
}

export interface BillingCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface CustomerOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  phone: string;
  quantity: number;
  notes: string;
  totalPrice: number;
  date: string;
  status: string; // "pending", "confirmed", "completed"
  customerId?: string;
}

export interface Review {
  id: string;
  customerName: string;
  review: string;
  rating: number; // 1-5
  date: string;
  status?: string; // "pending", "approved", "rejected"
}

export interface Employee {
  id: string;
  fullName: string;
  fatherName: string;
  age: string;
  cnic: string;
  mobile: string;
  bloodGroup: string;
  photo: string; // base64 data URL
  designation: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string; // e.g. "Rs 200" or "Starting from Rs 500"
  icon: string;
  image?: string; // base64 data URL or empty
  inStock?: boolean;
  discount?: number;
}

export interface BillingItem {
  id: string;
  name: string;
  sellingPrice: number;
  purchasePrice: number;
  category: string;
}

const _DEFAULT_SERVICES: Service[] = [
  {
    id: "s1",
    name: "Number Plates",
    description:
      "Custom number plates for vehicles, made with precision and durable material.",
    price: "Rs 200 - 500",
    icon: "🔢",
    inStock: true,
    discount: 0,
  },
  {
    id: "s2",
    name: "Sticker Cutting",
    description:
      "Professional sticker cutting in any shape or size for branding and decoration.",
    price: "Starting Rs 100",
    icon: "✂️",
    inStock: true,
    discount: 0,
  },
  {
    id: "s3",
    name: "Coating",
    description:
      "Protective coating services to give your prints a glossy or matte finish.",
    price: "Rs 50 per page",
    icon: "🛡️",
    inStock: true,
    discount: 0,
  },
  {
    id: "s4",
    name: "Duplicate Cards",
    description:
      "High-quality duplicate ID and membership cards made quickly and accurately.",
    price: "Rs 150 per card",
    icon: "🪪",
    inStock: true,
    discount: 0,
  },
  {
    id: "s5",
    name: "Sindhi / Urdu / Arabic / English Composing",
    description:
      "Professional multi-language composing and typesetting services.",
    price: "Rs 100 per page",
    icon: "📝",
    inStock: true,
    discount: 0,
  },
  {
    id: "s6",
    name: "Cap Printing",
    description:
      "Custom cap printing with logos and text for events, teams, and promotions.",
    price: "Rs 400 per cap",
    icon: "🧢",
    inStock: true,
    discount: 0,
  },
  {
    id: "s7",
    name: "T-Shirt Printing",
    description:
      "High-quality T-shirt printing with your custom design, text, or logo.",
    price: "Rs 500 per shirt",
    icon: "👕",
    inStock: true,
    discount: 0,
  },
  {
    id: "s8",
    name: "Photo Print",
    description: "Crystal clear photo prints in all sizes with vibrant colors.",
    price: "Rs 30 - 150",
    icon: "📷",
    inStock: true,
    discount: 0,
  },
  {
    id: "s9",
    name: "Photo Studio",
    description:
      "Professional photo studio sessions for ID photos, passports, and portraits.",
    price: "Rs 200 per session",
    icon: "📸",
    inStock: true,
    discount: 0,
  },
  {
    id: "s10",
    name: "Photocopy",
    description: "Fast and clear photocopying service for all your documents.",
    price: "Rs 5 per page",
    icon: "📄",
    inStock: true,
    discount: 0,
  },
  {
    id: "s11",
    name: "Panaflex (Flex Printing)",
    description:
      "Large-format flex printing for banners, billboards, and signage.",
    price: "Rs 80 per sq ft",
    icon: "🖼️",
    inStock: true,
    discount: 0,
  },
  {
    id: "s12",
    name: "Wedding Cards",
    description:
      "Beautiful and customized wedding invitation cards in multiple designs.",
    price: "Rs 15 per card",
    icon: "💌",
    inStock: true,
    discount: 0,
  },
  {
    id: "s13",
    name: "Visiting Cards",
    description:
      "Professional visiting cards in premium quality for individuals and businesses.",
    price: "Rs 200 per 100",
    icon: "💼",
    inStock: true,
    discount: 0,
  },
  {
    id: "s14",
    name: "Pamphlets",
    description:
      "Eye-catching pamphlets and flyers for events, promotions, and businesses.",
    price: "Rs 3 per page",
    icon: "📋",
    inStock: true,
    discount: 0,
  },
  {
    id: "s15",
    name: "Advertisements",
    description:
      "Custom advertisement designs and prints for all your marketing needs.",
    price: "Contact for pricing",
    icon: "📣",
    inStock: true,
    discount: 0,
  },
];

const KEYS = {
  invoices: "idpc_invoices",
  adminPassword: "idpc_admin_password",
  messages: "idpc_messages",
  reviews: "idpc_reviews",
  employees: "idpc_employees",
  services: "idpc_services",
  bannerImage: "idpc_banner_image",
  logo: "idpc_logo",
  orders: "idpc_orders",
  billingItems: "idpc_billing_items",
  billingCustomers: "idpc_billing_customers",
};

// Initialize storage on first load
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
  if (!localStorage.getItem(KEYS.employees)) {
    localStorage.setItem(KEYS.employees, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.services)) {
    localStorage.setItem(KEYS.services, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.orders)) {
    localStorage.setItem(KEYS.orders, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.messages)) {
    localStorage.setItem(KEYS.messages, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.billingItems)) {
    localStorage.setItem(KEYS.billingItems, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.billingCustomers)) {
    localStorage.setItem(KEYS.billingCustomers, JSON.stringify([]));
  }
}

export function getAdminPassword(): string {
  return localStorage.getItem(KEYS.adminPassword) || "kamii911";
}

export function setAdminPassword(password: string) {
  localStorage.setItem(KEYS.adminPassword, password);
}

export function getBannerImage(): string {
  return (
    localStorage.getItem(KEYS.bannerImage) ||
    "/assets/uploads/chatgpt_image_mar_27_2026_03_31_58_pm-019d2edf-d211-723c-8006-79a3a6a11d66-1.png"
  );
}

export function setBannerImage(dataUrl: string) {
  localStorage.setItem(KEYS.bannerImage, dataUrl);
}

export function getLogo(): string {
  return (
    localStorage.getItem(KEYS.logo) ||
    "/assets/uploads/screenshot_2026-03-26_231047-019d2b57-e48c-70e8-9b2c-db4c4ce8391c-1.png"
  );
}

export function setLogo(dataUrl: string) {
  localStorage.setItem(KEYS.logo, dataUrl);
}

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(KEYS.invoices);
  if (!data) return [];
  return JSON.parse(data) as Invoice[];
}

export function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(KEYS.invoices, JSON.stringify(invoices));
}

export function addInvoice(invoice: Invoice) {
  const invoices = getInvoices();
  // Prevent duplicate IDs — remove old entry with same id if present
  const filtered = invoices.filter((inv) => inv.id !== invoice.id);
  filtered.push(invoice);
  saveInvoices(filtered);
}

export function deleteInvoice(invoiceId: string) {
  const invoices = getInvoices();
  saveInvoices(invoices.filter((inv) => inv.id !== invoiceId));
}

export function updateInvoice(updated: Invoice) {
  const invoices = getInvoices();
  saveInvoices(invoices.map((inv) => (inv.id === updated.id ? updated : inv)));
}

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

/**
 * Returns a unique invoice ID using timestamp to prevent collisions.
 * Format: INV-<timestamp>
 */
export function getNextInvoiceNumber(): string {
  const ts = Date.now();
  return `INV-${ts}`;
}

/**
 * Returns a unique customer user ID using timestamp.
 * Format: CUST-<timestamp>
 */
export function getNextUserId(): string {
  const ts = Date.now();
  return `CUST-${ts}`;
}

// ---- Contact Messages ----

export function getContactMessages(): ContactMessage[] {
  const data = localStorage.getItem(KEYS.messages);
  if (!data) return [];
  const messages = JSON.parse(data);
  // Support both old format (no isRead) and new format
  return messages.map((m: Record<string, unknown>) => ({
    isRead: false,
    ...m,
  })) as ContactMessage[];
}

export function saveContactMessages(messages: ContactMessage[]) {
  localStorage.setItem(KEYS.messages, JSON.stringify(messages));
}

export function saveMessage(
  msg: Omit<ContactMessage, "id" | "date" | "isRead">,
) {
  const messages = getContactMessages();
  messages.push({
    ...msg,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
    isRead: false,
  });
  saveContactMessages(messages);
}

// ---- Orders ----

export function getOrders(): CustomerOrder[] {
  const data = localStorage.getItem(KEYS.orders);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: CustomerOrder[]) {
  localStorage.setItem(KEYS.orders, JSON.stringify(orders));
}

export function addOrder(
  order: Omit<CustomerOrder, "id" | "date">,
): CustomerOrder {
  const orders = getOrders();
  const newOrder: CustomerOrder = {
    ...order,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function deleteOrder(id: string) {
  saveOrders(getOrders().filter((o) => o.id !== id));
}

export function updateOrder(updated: CustomerOrder) {
  saveOrders(getOrders().map((o) => (o.id === updated.id ? updated : o)));
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

// ---- Employees ----

export function getEmployees(): Employee[] {
  const data = localStorage.getItem(KEYS.employees);
  return data ? JSON.parse(data) : [];
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem(KEYS.employees, JSON.stringify(employees));
}

export function addEmployee(emp: Omit<Employee, "id">) {
  const employees = getEmployees();
  employees.push({ ...emp, id: Date.now().toString() });
  saveEmployees(employees);
}

export function updateEmployee(updated: Employee) {
  saveEmployees(getEmployees().map((e) => (e.id === updated.id ? updated : e)));
}

export function deleteEmployee(id: string) {
  saveEmployees(getEmployees().filter((e) => e.id !== id));
}

// ---- Services ----

export function getServices(): Service[] {
  const data = localStorage.getItem(KEYS.services);
  return data ? JSON.parse(data) : [];
}

export function saveServices(services: Service[]) {
  localStorage.setItem(KEYS.services, JSON.stringify(services));
}

// ---- Billing Items ----

export function getBillingItems(): BillingItem[] {
  const data = localStorage.getItem(KEYS.billingItems);
  return data ? JSON.parse(data) : [];
}

export function saveBillingItems(items: BillingItem[]) {
  localStorage.setItem(KEYS.billingItems, JSON.stringify(items));
}

export function addBillingItemToStorage(
  item: Omit<BillingItem, "id">,
): BillingItem {
  const items = getBillingItems();
  const newItem: BillingItem = { ...item, id: Date.now().toString() };
  items.push(newItem);
  saveBillingItems(items);
  return newItem;
}

export function updateBillingItemInStorage(updated: BillingItem) {
  saveBillingItems(
    getBillingItems().map((i) => (i.id === updated.id ? updated : i)),
  );
}

export function deleteBillingItemFromStorage(id: string) {
  saveBillingItems(getBillingItems().filter((i) => i.id !== id));
}

// ---- Billing Customers ----

export function getBillingCustomers(): BillingCustomer[] {
  const data = localStorage.getItem("idpc_billing_customers");
  return data ? JSON.parse(data) : [];
}

export function saveBillingCustomers(customers: BillingCustomer[]) {
  localStorage.setItem("idpc_billing_customers", JSON.stringify(customers));
}

export function addBillingCustomer(
  name: string,
  phone: string,
  address?: string,
): BillingCustomer {
  const customers = getBillingCustomers();
  // Don't add duplicate (same name, case-insensitive)
  const exists = customers.find(
    (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  if (exists) return exists;
  const newCustomer: BillingCustomer = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    address: (address || "").trim(),
  };
  customers.push(newCustomer);
  saveBillingCustomers(customers);
  return newCustomer;
}

export function deleteBillingCustomer(id: string) {
  saveBillingCustomers(getBillingCustomers().filter((c) => c.id !== id));
}
