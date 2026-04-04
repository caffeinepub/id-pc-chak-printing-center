import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // ===== Type Definitions =====

  type InvoiceItem = {
    srNo : Nat;
    particular : Text;
    quantity : Text;
    quality : Text;
    rate : Nat;
    total : Nat;
    billingItemId : Nat;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Storage.ExternalBlob;
    inStock : Bool;
    discount : Nat;
  };

  type Employee = {
    id : Nat;
    fullName : Text;
    fatherName : Text;
    age : Nat;
    cnic : Text;
    mobile : Text;
    bloodGroup : Text;
    photo : Storage.ExternalBlob;
    designation : Text;
  };

  type Review = {
    id : Nat;
    customerName : Text;
    review : Text;
    rating : Nat;
    status : Text;
    date : Text;
  };

  type Invoice = {
    id : Nat;
    customerName : Text;
    phone : Text;
    address : Text;
    date : Text;
    grandTotal : Nat;
    advance : Nat;
    balance : Nat;
    discount : Nat;
    items : [InvoiceItem];
  };

  type CustomerOrder = {
    id : Nat;
    serviceId : Text;
    serviceName : Text;
    customerName : Text;
    phone : Text;
    quantity : Nat;
    notes : Text;
    totalPrice : Nat;
    date : Text;
    status : Text;
  };

  type ContactMessage = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    date : Text;
    isRead : Bool;
  };

  type BillingItem = {
    id : Nat;
    name : Text;
    sellingPrice : Nat;
    purchasePrice : Nat;
    category : Text;
  };

  type AboutStats = {
    experience : Text;
    clientsCount : Text;
  };

  // ===== Persistent State =====

  var logo : Text = "";
  var adminPassword : Text = "";
  let services = Map.empty<Nat, Service>();
  let employees = Map.empty<Nat, Employee>();
  let reviews = Map.empty<Nat, Review>();
  let invoices = Map.empty<Nat, Invoice>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let contactMessages = Map.empty<Nat, ContactMessage>();
  let billingItems = Map.empty<Nat, BillingItem>();
  var aboutStats : ?AboutStats = null;

  // ===== Logo / Password =====

  public shared ({ caller }) func getLogo() : async Text { logo };
  public shared ({ caller }) func setLogo(v : Text) : async () {
    logo := v;
  };

  public shared ({ caller }) func getAdminPassword() : async Text { adminPassword };
  public shared ({ caller }) func setAdminPassword(v : Text) : async () {
    adminPassword := v;
  };

  // ===== Services CRUD =====

  public shared ({ caller }) func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public shared ({ caller }) func getService(id : Nat) : async ?Service {
    services.get(id);
  };

  public shared ({ caller }) func addService(s : Service) : async () {
    services.add(s.id, s);
  };

  public shared ({ caller }) func updateService(id : Nat, s : Service) : async Bool {
    if (services.containsKey(id)) {
      services.add(id, s);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async Bool {
    if (services.containsKey(id)) {
      services.remove(id);
      true;
    } else { false };
  };

  // ===== Employees CRUD =====

  public shared ({ caller }) func getAllEmployees() : async [Employee] {
    employees.values().toArray();
  };

  public shared ({ caller }) func getEmployee(id : Nat) : async ?Employee {
    employees.get(id);
  };

  public shared ({ caller }) func addEmployee(e : Employee) : async () {
    employees.add(e.id, e);
  };

  public shared ({ caller }) func updateEmployee(id : Nat, e : Employee) : async Bool {
    if (employees.containsKey(id)) {
      employees.add(id, e);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteEmployee(id : Nat) : async Bool {
    if (employees.containsKey(id)) {
      employees.remove(id);
      true;
    } else { false };
  };

  // ===== Reviews CRUD =====

  public shared ({ caller }) func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public shared ({ caller }) func getReview(id : Nat) : async ?Review {
    reviews.get(id);
  };

  public shared ({ caller }) func addReview(r : Review) : async () {
    reviews.add(r.id, r);
  };

  public shared ({ caller }) func updateReview(id : Nat, r : Review) : async Bool {
    if (reviews.containsKey(id)) {
      reviews.add(id, r);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteReview(id : Nat) : async Bool {
    if (reviews.containsKey(id)) {
      reviews.remove(id);
      true;
    } else { false };
  };

  public shared ({ caller }) func getApprovedReviews() : async [Review] {
    reviews.values().toArray().filter(func(r) { r.status == "approved" });
  };

  public shared ({ caller }) func getPendingReviews() : async [Review] {
    reviews.values().toArray().filter(func(r) { r.status == "pending" });
  };

  // ===== Invoices CRUD =====

  public shared ({ caller }) func getAllInvoices() : async [Invoice] {
    invoices.values().toArray();
  };

  public shared ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    invoices.get(id);
  };

  public shared ({ caller }) func addInvoice(inv : Invoice) : async () {
    invoices.add(inv.id, inv);
  };

  public shared ({ caller }) func updateInvoice(id : Nat, inv : Invoice) : async Bool {
    if (invoices.containsKey(id)) {
      invoices.add(id, inv);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async Bool {
    if (invoices.containsKey(id)) {
      invoices.remove(id);
      true;
    } else { false };
  };

  // ===== Customer Orders CRUD =====

  public shared ({ caller }) func getAllCustomerOrders() : async [CustomerOrder] {
    customerOrders.values().toArray();
  };

  public shared ({ caller }) func getCustomerOrder(id : Nat) : async ?CustomerOrder {
    customerOrders.get(id);
  };

  public shared ({ caller }) func addCustomerOrder(o : CustomerOrder) : async () {
    customerOrders.add(o.id, o);
  };

  public shared ({ caller }) func updateCustomerOrder(id : Nat, o : CustomerOrder) : async Bool {
    if (customerOrders.containsKey(id)) {
      customerOrders.add(id, o);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteCustomerOrder(id : Nat) : async Bool {
    if (customerOrders.containsKey(id)) {
      customerOrders.remove(id);
      true;
    } else { false };
  };

  // ===== Contact Messages CRUD =====

  public shared ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    contactMessages.values().toArray();
  };

  public shared ({ caller }) func getContactMessage(id : Nat) : async ?ContactMessage {
    contactMessages.get(id);
  };

  public shared ({ caller }) func addContactMessage(m : ContactMessage) : async () {
    contactMessages.add(m.id, m);
  };

  public shared ({ caller }) func markContactMessageRead(id : Nat) : async Bool {
    switch (contactMessages.get(id)) {
      case (?msg) {
        let updatedMsg = { msg with isRead = true };
        contactMessages.add(id, updatedMsg);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func deleteContactMessage(id : Nat) : async Bool {
    if (contactMessages.containsKey(id)) {
      contactMessages.remove(id);
      true;
    } else { false };
  };

  // ===== Billing Items CRUD =====

  public shared ({ caller }) func getAllBillingItems() : async [BillingItem] {
    billingItems.values().toArray();
  };

  public shared ({ caller }) func getBillingItem(id : Nat) : async ?BillingItem {
    billingItems.get(id);
  };

  public shared ({ caller }) func addBillingItem(item : BillingItem) : async () {
    billingItems.add(item.id, item);
  };

  public shared ({ caller }) func updateBillingItem(id : Nat, item : BillingItem) : async Bool {
    if (billingItems.containsKey(id)) {
      billingItems.add(id, item);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteBillingItem(id : Nat) : async Bool {
    if (billingItems.containsKey(id)) {
      billingItems.remove(id);
      true;
    } else { false };
  };

  // ===== About Stats CRUD =====

  public shared ({ caller }) func getAboutStats() : async ?AboutStats {
    aboutStats;
  };

  public shared ({ caller }) func setAboutStats(stats : AboutStats) : async () {
    aboutStats := ?stats;
  };
};
