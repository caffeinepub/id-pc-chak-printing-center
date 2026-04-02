import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Service {
    id: bigint;
    name: string;
    description: string;
    price: string;
    icon: string;
    image: string;
}
export interface Employee {
    id: bigint;
    fullName: string;
    fatherName: string;
    age: bigint;
    cnic: string;
    mobile: string;
    bloodGroup: string;
    photo: string;
    designation: string;
}
export interface Review {
    id: bigint;
    customerName: string;
    review: string;
    rating: bigint;
    date: string;
}
export interface InvoiceItem {
    srNo: bigint;
    particular: string;
    quantity: string;
    quality: string;
    rate: bigint;
    total: bigint;
}
export interface Invoice {
    id: bigint;
    userId: bigint;
    customerName: string;
    phone: string;
    address: string;
    date: string;
    grandTotal: bigint;
    advance: bigint;
    balance: bigint;
    discount: bigint;
    items: Array<InvoiceItem>;
}
export interface CustomerOrder {
    id: bigint;
    serviceId: string;
    serviceName: string;
    customerName: string;
    phone: string;
    quantity: bigint;
    notes: string;
    totalPrice: bigint;
    date: string;
    status: string;
}
export interface ContactMessage {
    id: bigint;
    name: string;
    phone: string;
    message: string;
    date: string;
    isRead: boolean;
}
export interface backendInterface {
    getLogo(): Promise<string>;
    setLogo(v: string): Promise<void>;
    getBannerImage(): Promise<string>;
    setBannerImage(v: string): Promise<void>;
    getAdminPassword(): Promise<string>;
    setAdminPassword(v: string): Promise<void>;
    getAllServices(): Promise<Array<Service>>;
    addService(s: Service): Promise<void>;
    updateService(id: bigint, s: Service): Promise<boolean>;
    deleteService(id: bigint): Promise<boolean>;
    getAllEmployees(): Promise<Array<Employee>>;
    addEmployee(e: Employee): Promise<void>;
    updateEmployee(id: bigint, e: Employee): Promise<boolean>;
    deleteEmployee(id: bigint): Promise<boolean>;
    getAllReviews(): Promise<Array<Review>>;
    addReview(r: Review): Promise<void>;
    updateReview(id: bigint, r: Review): Promise<boolean>;
    deleteReview(id: bigint): Promise<boolean>;
    getAllInvoices(): Promise<Array<Invoice>>;
    addInvoice(inv: Invoice): Promise<void>;
    updateInvoice(id: bigint, inv: Invoice): Promise<boolean>;
    deleteInvoice(id: bigint): Promise<boolean>;
    getAllCustomerOrders(): Promise<Array<CustomerOrder>>;
    addCustomerOrder(o: CustomerOrder): Promise<void>;
    updateCustomerOrder(id: bigint, o: CustomerOrder): Promise<boolean>;
    deleteCustomerOrder(id: bigint): Promise<boolean>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    addContactMessage(m: ContactMessage): Promise<void>;
    markContactMessageRead(id: bigint): Promise<boolean>;
    deleteContactMessage(id: bigint): Promise<boolean>;
}
