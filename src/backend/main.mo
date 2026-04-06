import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
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
    customerId : ?Nat;
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

  type CustomerAccount = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    passwordHash : Text;
    googleId : Text;
    isGoogleUser : Bool;
    createdAt : Int;
    lastLoginAt : Int;
    isActive : Bool;
  };

  type BillingCustomer = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
  };

  type SecurityAnswers = {
    answer1 : Text;
    answer2 : Text;
    answer3 : Text;
  };

  // Persistent state variables
  var logo : Text = "";
  var bannerImage : Text = "";
  var companiesJson : Text = "";
  var employeesJson : Text = ""; // Full employees data with photos as JSON
  var servicesJson : Text = "";  // Full services data with images as JSON

  var adminPassword : Text = "";
  let services = Map.empty<Nat, Service>();
  let employees = Map.empty<Nat, Employee>();
  let reviews = Map.empty<Nat, Review>();
  let invoices = Map.empty<Nat, Invoice>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let contactMessages = Map.empty<Nat, ContactMessage>();
  let billingItems = Map.empty<Nat, BillingItem>();
  let billingCustomers = Map.empty<Nat, BillingCustomer>();
  let customers = Map.empty<Nat, CustomerAccount>();
  var aboutStats : ?AboutStats = null;
  var securityAnswers : SecurityAnswers = {
    answer1 = "";
    answer2 = "";
    answer3 = "";
  };

  include MixinStorage();

  // ===== LOGO & PASSWORD =====

  public shared ({ caller }) func getLogo() : async Text {
    logo;
  };
  public shared ({ caller }) func setLogo(v : Text) : async () {
    logo := v;
  };

  public shared ({ caller }) func getAdminPassword() : async Text {
    adminPassword;
  };
  public shared ({ caller }) func setAdminPassword(v : Text) : async () {
    adminPassword := v;
  };

  // ===== BANNER & COMPANIES =====

  public shared ({ caller }) func getBannerImage() : async Text {
    bannerImage;
  };
  public shared ({ caller }) func setBannerImage(v : Text) : async () {
    bannerImage := v;
  };

  public shared ({ caller }) func getCompaniesJson() : async Text {
    companiesJson;
  };
  public shared ({ caller }) func setCompaniesJson(v : Text) : async () {
    companiesJson := v;
  };

  // ===== EMPLOYEES JSON (with full photo data) =====

  public shared ({ caller }) func getEmployeesJson() : async Text {
    employeesJson;
  };
  public shared ({ caller }) func setEmployeesJson(v : Text) : async () {
    employeesJson := v;
  };

  // ===== SERVICES JSON (with full image data) =====

  public shared ({ caller }) func getServicesJson() : async Text {
    servicesJson;
  };
  public shared ({ caller }) func setServicesJson(v : Text) : async () {
    servicesJson := v;
  };

  // ===== SERVICES CRUD =====

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

  // ===== EMPLOYEES CRUD =====

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

  // ===== REVIEWS CRUD =====

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

  // ===== INVOICES CRUD =====

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

  public shared ({ caller }) func getInvoicesByCustomerPhone(phone : Text) : async [Invoice] {
    let matchingInvoices = invoices.toArray().filter(func((_, invoice)) { invoice.phone == phone });
    let invoiceArray = matchingInvoices.map(func((_, invoice)) { invoice });
    invoiceArray;
  };

  // ===== CUSTOMER ORDERS CRUD =====

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

  public shared ({ caller }) func getOrdersByCustomer(customerId : Nat) : async [CustomerOrder] {
    customerOrders.values().toArray().filter(
      func(order) {
        switch (order.customerId) {
          case (null) { false };
          case (?id) { id == customerId };
        };
      }
    );
  };

  // ===== CONTACT MESSAGES CRUD =====

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

  // ===== BILLING ITEMS CRUD =====

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

  // ===== BILLING CUSTOMERS CRUD =====

  public shared ({ caller }) func getAllBillingCustomers() : async [BillingCustomer] {
    billingCustomers.values().toArray();
  };

  public shared ({ caller }) func getBillingCustomer(id : Nat) : async ?BillingCustomer {
    billingCustomers.get(id);
  };

  public shared ({ caller }) func addBillingCustomer(customer : BillingCustomer) : async () {
    billingCustomers.add(customer.id, customer);
  };

  public shared ({ caller }) func updateBillingCustomer(id : Nat, customer : BillingCustomer) : async Bool {
    if (billingCustomers.containsKey(id)) {
      billingCustomers.add(id, customer);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteBillingCustomer(id : Nat) : async Bool {
    if (billingCustomers.containsKey(id)) {
      billingCustomers.remove(id);
      true;
    } else { false };
  };

  // ===== ABOUT STATS CRUD =====

  public shared ({ caller }) func getAboutStats() : async ?AboutStats {
    aboutStats;
  };

  public shared ({ caller }) func setAboutStats(stats : AboutStats) : async () {
    aboutStats := ?stats;
  };

  // ===== CUSTOMERS CRUD =====

  public shared ({ caller }) func registerCustomer(c : CustomerAccount) : async () {
    let existingCustomer = customers.toArray().find(
      func((_, account)) { account.email == c.email }
    );
    switch (existingCustomer) {
      case (?_) { Runtime.trap("Customer with email already exists!") };
      case (null) { customers.add(c.id, c) };
    };
  };

  public shared ({ caller }) func updateCustomer(id : Nat, c : CustomerAccount) : async Bool {
    if (customers.containsKey(id)) {
      customers.add(id, c);
      true;
    } else { false };
  };

  public shared ({ caller }) func getCustomerById(id : Nat) : async ?CustomerAccount {
    customers.get(id);
  };

  public shared ({ caller }) func getCustomerByEmail(email : Text) : async ?CustomerAccount {
    let customer = customers.toArray().find(
      func((_, account)) { account.email == email }
    );
    switch (customer) {
      case (null) { null };
      case (?(id, c)) { ?c };
    };
  };

  public shared ({ caller }) func getAllCustomers() : async [CustomerAccount] {
    customers.values().toArray();
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async Bool {
    if (customers.containsKey(id)) {
      customers.remove(id);
      true;
    } else { false };
  };

  public shared ({ caller }) func updateCustomerLastLogin(id : Nat) : async Bool {
    switch (customers.get(id)) {
      case (null) { false };
      case (?c) {
        customers.add(
          id,
          {
            c with lastLoginAt = Time.now();
          },
        );
        true;
      };
    };
  };

  // ===== SECURITY ANSWERS =====

  public shared ({ caller }) func setSecurityAnswers(s : SecurityAnswers) : async () {
    securityAnswers := s;
  };

  public shared ({ caller }) func getSecurityAnswers() : async SecurityAnswers {
    securityAnswers;
  };
};
