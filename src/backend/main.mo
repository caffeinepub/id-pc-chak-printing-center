import Migration "migration";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

// Printing shop backend for ID&PC Chak
// Stores: logo, banner, admin password, services, employees, reviews, invoices, customer orders, contact messages

(with migration = Migration.run)
actor {
  // ===== Type Definitions =====

  type InvoiceItem = {
    srNo : Nat;
    particular : Text;
    quantity : Text;
    quality : Text;
    rate : Nat;
    total : Nat;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Text;  // base64 data URL or empty string
  };

  type Employee = {
    id : Nat;
    fullName : Text;
    fatherName : Text;
    age : Nat;
    cnic : Text;
    mobile : Text;
    bloodGroup : Text;
    photo : Text;  // base64 data URL
    designation : Text;
  };

  type Review = {
    id : Nat;
    customerName : Text;
    review : Text;
    rating : Nat;
    date : Text;
  };

  type Invoice = {
    id : Nat;
    userId : Nat;
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

  // ===== Persistent State =====

  var logo : Text = "";
  var bannerImage : Text = "";
  var adminPassword : Text = "";
  let services = Map.empty<Nat, Service>();
  let employees = Map.empty<Nat, Employee>();
  let reviews = Map.empty<Nat, Review>();
  let invoices = Map.empty<Nat, Invoice>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let contactMessages = Map.empty<Nat, ContactMessage>();

  // ===== Logo / Banner / Password =====

  public func getLogo() : async Text { logo };
  public func setLogo(v : Text) : async () { logo := v };

  public func getBannerImage() : async Text { bannerImage };
  public func setBannerImage(v : Text) : async () { bannerImage := v };

  public func getAdminPassword() : async Text { adminPassword };
  public func setAdminPassword(v : Text) : async () { adminPassword := v };

  // ===== Services CRUD =====

  public func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public func addService(s : Service) : async () {
    services.add(s.id, s);
  };

  public func updateService(id : Nat, s : Service) : async Bool {
    if (services.containsKey(id)) { services.add(id, s); true } else { false };
  };

  public func deleteService(id : Nat) : async Bool {
    if (services.containsKey(id)) { services.remove(id); true } else { false };
  };

  // ===== Employees CRUD =====

  public func getAllEmployees() : async [Employee] {
    employees.values().toArray();
  };

  public func addEmployee(e : Employee) : async () {
    employees.add(e.id, e);
  };

  public func updateEmployee(id : Nat, e : Employee) : async Bool {
    if (employees.containsKey(id)) { employees.add(id, e); true } else { false };
  };

  public func deleteEmployee(id : Nat) : async Bool {
    if (employees.containsKey(id)) { employees.remove(id); true } else { false };
  };

  // ===== Reviews CRUD =====

  public func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public func addReview(r : Review) : async () {
    reviews.add(r.id, r);
  };

  public func updateReview(id : Nat, r : Review) : async Bool {
    if (reviews.containsKey(id)) { reviews.add(id, r); true } else { false };
  };

  public func deleteReview(id : Nat) : async Bool {
    if (reviews.containsKey(id)) { reviews.remove(id); true } else { false };
  };

  // ===== Invoices CRUD =====

  public func getAllInvoices() : async [Invoice] {
    invoices.values().toArray();
  };

  public func addInvoice(inv : Invoice) : async () {
    invoices.add(inv.id, inv);
  };

  public func updateInvoice(id : Nat, inv : Invoice) : async Bool {
    if (invoices.containsKey(id)) { invoices.add(id, inv); true } else { false };
  };

  public func deleteInvoice(id : Nat) : async Bool {
    if (invoices.containsKey(id)) { invoices.remove(id); true } else { false };
  };

  // ===== Customer Orders CRUD =====

  public func getAllCustomerOrders() : async [CustomerOrder] {
    customerOrders.values().toArray();
  };

  public func addCustomerOrder(o : CustomerOrder) : async () {
    customerOrders.add(o.id, o);
  };

  public func updateCustomerOrder(id : Nat, o : CustomerOrder) : async Bool {
    if (customerOrders.containsKey(id)) { customerOrders.add(id, o); true } else { false };
  };

  public func deleteCustomerOrder(id : Nat) : async Bool {
    if (customerOrders.containsKey(id)) { customerOrders.remove(id); true } else { false };
  };

  // ===== Contact Messages CRUD =====

  public func getAllContactMessages() : async [ContactMessage] {
    contactMessages.values().toArray();
  };

  public func addContactMessage(m : ContactMessage) : async () {
    contactMessages.add(m.id, m);
  };

  public func markContactMessageRead(id : Nat) : async Bool {
    switch (contactMessages.get(id)) {
      case (?msg) {
        contactMessages.add(id, { id = msg.id; name = msg.name; phone = msg.phone; message = msg.message; date = msg.date; isRead = true });
        true;
      };
      case null { false };
    };
  };

  public func deleteContactMessage(id : Nat) : async Bool {
    if (contactMessages.containsKey(id)) { contactMessages.remove(id); true } else { false };
  };
};
