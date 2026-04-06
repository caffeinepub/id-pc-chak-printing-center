import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CustomerOrder {
    id: bigint;
    customerName: string;
    status: string;
    serviceName: string;
    date: string;
    notes: string;
    quantity: bigint;
    customerId?: bigint;
    serviceId: string;
    phone: string;
    totalPrice: bigint;
}
export interface InvoiceItem {
    total: bigint;
    billingItemId: bigint;
    quality: string;
    rate: bigint;
    srNo: bigint;
    particular: string;
    quantity: string;
}
export interface Service {
    id: bigint;
    inStock: boolean;
    icon: string;
    name: string;
    description: string;
    discount: bigint;
    image: ExternalBlob;
    price: string;
}
export interface AboutStats {
    clientsCount: string;
    experience: string;
}
export interface Invoice {
    id: bigint;
    customerName: string;
    balance: bigint;
    date: string;
    grandTotal: bigint;
    address: string;
    discount: bigint;
    phone: string;
    items: Array<InvoiceItem>;
    advance: bigint;
}
export interface BillingCustomer {
    id: bigint;
    name: string;
    address: string;
    phone: string;
}
export interface BillingItem {
    id: bigint;
    purchasePrice: bigint;
    name: string;
    sellingPrice: bigint;
    category: string;
}
export interface ContactMessage {
    id: bigint;
    date: string;
    name: string;
    isRead: boolean;
    message: string;
    phone: string;
}
export interface SecurityAnswers {
    answer1: string;
    answer2: string;
    answer3: string;
}
export interface CustomerAccount {
    id: bigint;
    googleId: string;
    lastLoginAt: bigint;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    email: string;
    passwordHash: string;
    isGoogleUser: boolean;
    phone: string;
}
export interface Employee {
    id: bigint;
    age: bigint;
    cnic: string;
    designation: string;
    fullName: string;
    fatherName: string;
    bloodGroup: string;
    mobile: string;
    photo: ExternalBlob;
}
export interface Review {
    id: bigint;
    customerName: string;
    status: string;
    review: string;
    date: string;
    rating: bigint;
}
export interface backendInterface {
    addBillingCustomer(customer: BillingCustomer): Promise<void>;
    addBillingItem(item: BillingItem): Promise<void>;
    addContactMessage(m: ContactMessage): Promise<void>;
    addCustomerOrder(o: CustomerOrder): Promise<void>;
    addEmployee(e: Employee): Promise<void>;
    addInvoice(inv: Invoice): Promise<void>;
    addReview(r: Review): Promise<void>;
    addService(s: Service): Promise<void>;
    deleteBillingCustomer(id: bigint): Promise<boolean>;
    deleteBillingItem(id: bigint): Promise<boolean>;
    deleteContactMessage(id: bigint): Promise<boolean>;
    deleteCustomer(id: bigint): Promise<boolean>;
    deleteCustomerOrder(id: bigint): Promise<boolean>;
    deleteEmployee(id: bigint): Promise<boolean>;
    deleteInvoice(id: bigint): Promise<boolean>;
    deleteReview(id: bigint): Promise<boolean>;
    deleteService(id: bigint): Promise<boolean>;
    getAboutStats(): Promise<AboutStats | null>;
    getAdminPassword(): Promise<string>;
    getAllBillingCustomers(): Promise<Array<BillingCustomer>>;
    getAllBillingItems(): Promise<Array<BillingItem>>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllCustomerOrders(): Promise<Array<CustomerOrder>>;
    getAllCustomers(): Promise<Array<CustomerAccount>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllReviews(): Promise<Array<Review>>;
    getAllServices(): Promise<Array<Service>>;
    getApprovedReviews(): Promise<Array<Review>>;
    getBannerImage(): Promise<string>;
    getBillingCustomer(id: bigint): Promise<BillingCustomer | null>;
    getBillingItem(id: bigint): Promise<BillingItem | null>;
    getCompaniesJson(): Promise<string>;
    getServicesJson(): Promise<string>;
    getEmployeesJson(): Promise<string>;
    getContactMessage(id: bigint): Promise<ContactMessage | null>;
    getCustomerByEmail(email: string): Promise<CustomerAccount | null>;
    getCustomerById(id: bigint): Promise<CustomerAccount | null>;
    getCustomerOrder(id: bigint): Promise<CustomerOrder | null>;
    getEmployee(id: bigint): Promise<Employee | null>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getInvoicesByCustomerPhone(phone: string): Promise<Array<Invoice>>;
    getLogo(): Promise<string>;
    getOrdersByCustomer(customerId: bigint): Promise<Array<CustomerOrder>>;
    getPendingReviews(): Promise<Array<Review>>;
    getReview(id: bigint): Promise<Review | null>;
    getSecurityAnswers(): Promise<SecurityAnswers>;
    getService(id: bigint): Promise<Service | null>;
    markContactMessageRead(id: bigint): Promise<boolean>;
    registerCustomer(c: CustomerAccount): Promise<void>;
    setAboutStats(stats: AboutStats): Promise<void>;
    setAdminPassword(v: string): Promise<void>;
    setBannerImage(v: string): Promise<void>;
    setCompaniesJson(v: string): Promise<void>;
    setServicesJson(v: string): Promise<void>;
    setEmployeesJson(v: string): Promise<void>;
    setLogo(v: string): Promise<void>;
    setSecurityAnswers(s: SecurityAnswers): Promise<void>;
    updateBillingCustomer(id: bigint, customer: BillingCustomer): Promise<boolean>;
    updateBillingItem(id: bigint, item: BillingItem): Promise<boolean>;
    updateCustomer(id: bigint, c: CustomerAccount): Promise<boolean>;
    updateCustomerLastLogin(id: bigint): Promise<boolean>;
    updateCustomerOrder(id: bigint, o: CustomerOrder): Promise<boolean>;
    updateEmployee(id: bigint, e: Employee): Promise<boolean>;
    updateInvoice(id: bigint, inv: Invoice): Promise<boolean>;
    updateReview(id: bigint, r: Review): Promise<boolean>;
    updateService(id: bigint, s: Service): Promise<boolean>;
}
