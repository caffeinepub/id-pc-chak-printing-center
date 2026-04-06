import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  // ===== LEGACY V1 TYPES (kept for stable variable compatibility) =====
  // These types match what was stored in the canister before the migration.
  // Do NOT remove them — the stable variables 'employees' and 'services' still
  // use these types and will be migrated to V2 on first access.
  type EmployeeV1 = {
    id : Nat;
    fullName : Text;
    fatherName : Text;
    age : Nat;
    cnic : Text;
    mobile : Text;
    bloodGroup : Text;
    photo : Blob;
    designation : Text;
  };

  type ServiceV1 = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Blob;
    inStock : Bool;
    discount : Nat;
  };

  type InvoiceItem = {
    srNo : Nat;
    particular : Text;
    quantity : Text;
    quality : Text;
    rate : Nat;
    total : Nat;
    billingItemId : Nat;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    image : Text;
    inStock : Bool;
    discount : Nat;
    createdAt : Int;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Text;
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
    photoUrl : Text;
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

  // Old Invoice type (without paymentStatus/userId/terms) — kept for stable migration
  type InvoiceV1 = {
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

  // New Invoice type with extra fields
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
    paymentStatus : Text;
    userId : Text;
    terms : Text;
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
  let products = Map.empty<Nat, Product>();
  // V1 maps — kept for stable variable compatibility.
  // New data goes into V2 maps below; V1 maps are only read during migration.
  let services = Map.empty<Nat, ServiceV1>();
  let employees = Map.empty<Nat, EmployeeV1>();
  // V2 maps — use new types with Text fields instead of Blob
  let servicesV2 = Map.empty<Nat, Service>();
  let employeesV2 = Map.empty<Nat, Employee>();
  var employeesMigrated : Bool = false;
  var servicesMigrated : Bool = false;
  let reviews = Map.empty<Nat, Review>();

  // MIGRATION: Keep old invoice map as InvoiceV1 so stable variable is compatible.
  // New invoices are stored in invoicesV2. On first run, invoicesV2 is populated
  // from invoices (the V1 map) with default values for new fields.
  let invoices = Map.empty<Nat, InvoiceV1>();
  let invoicesV2 = Map.empty<Nat, Invoice>();
  var invoicesMigrated : Bool = false;

  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let contactMessages = Map.empty<Nat, ContactMessage>();
  let billingItems = Map.empty<Nat, BillingItem>();
  let billingCustomers = Map.empty<Nat, BillingCustomer>();
  let customers = Map.empty<Nat, CustomerAccount>();
  var aboutStats : ?AboutStats = null;
  var migrationDone : Bool = false;
  var securityAnswers : SecurityAnswers = {
    answer1 = "";
    answer2 = "";
    answer3 = "";
  };

  include MixinStorage();

  // ===== INVOICE V1 -> V2 MIGRATION =====
  // Runs automatically on first call, migrates old invoices into invoicesV2

  func ensureInvoicesMigrated() {
    if (invoicesMigrated) return;
    invoicesMigrated := true;
    // Copy every V1 invoice into V2 with default values for new fields
    for ((k, v) in invoices.toArray().vals()) {
      if (not invoicesV2.containsKey(k)) {
        invoicesV2.add(k, {
          id = v.id;
          customerName = v.customerName;
          phone = v.phone;
          address = v.address;
          date = v.date;
          grandTotal = v.grandTotal;
          advance = v.advance;
          balance = v.balance;
          discount = v.discount;
          items = v.items;
          paymentStatus = "unpaid";
          userId = "";
          terms = "";
        });
      };
    };
  };

  // ===== EMPLOYEES V1 -> V2 MIGRATION =====
  // Copies old employees (with Blob photo) into employeesV2 (with Text photoUrl = "")
  // Photos are stored separately in employeesJson so photoUrl starts as empty string.
  func ensureEmployeesMigrated() {
    if (employeesMigrated) return;
    employeesMigrated := true;
    for ((k, v) in employees.toArray().vals()) {
      if (not employeesV2.containsKey(k)) {
        employeesV2.add(k, {
          id = v.id;
          fullName = v.fullName;
          fatherName = v.fatherName;
          age = v.age;
          cnic = v.cnic;
          mobile = v.mobile;
          bloodGroup = v.bloodGroup;
          designation = v.designation;
          photoUrl = "";
        });
      };
    };
  };

  // ===== SERVICES V1 -> V2 MIGRATION =====
  // Copies old services (with Blob image) into servicesV2 (with Text image = "")
  // Images are stored separately in servicesJson so image starts as empty string.
  func ensureServicesMigrated() {
    if (servicesMigrated) return;
    servicesMigrated := true;
    for ((k, v) in services.toArray().vals()) {
      if (not servicesV2.containsKey(k)) {
        servicesV2.add(k, {
          id = v.id;
          name = v.name;
          description = v.description;
          price = v.price;
          icon = v.icon;
          image = "";
          inStock = v.inStock;
          discount = v.discount;
        });
      };
    };
  };

  // ===== NEW PRODUCT CRUD =====

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsCount() : async Nat {
    products.size();
  };

  public shared ({ caller }) func addProduct(p : Product) : async () {
    products.add(p.id, p);
  };

  public shared ({ caller }) func updateProduct(id : Nat, p : Product) : async Bool {
    if (products.containsKey(id)) {
      products.add(id, p);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    if (products.containsKey(id)) {
      products.remove(id);
      true;
    } else { false };
  };

  // ===== MIGRATION TRACKING =====

  public query func getMigrationDone() : async Bool {
    migrationDone;
  };

  public shared ({ caller }) func setMigrationDone(v : Bool) : async () {
    migrationDone := v;
  };

  // ===== LOGO & PASSWORD =====

  public query func getLogo() : async Text {
    logo;
  };
  public shared ({ caller }) func setLogo(v : Text) : async () {
    logo := v;
  };

  public query func getAdminPassword() : async Text {
    adminPassword;
  };

  public shared ({ caller }) func setAdminPassword(v : Text) : async () {
    adminPassword := v;
  };

  // ===== BANNER & COMPANIES =====

  public query func getBannerImage() : async Text {
    bannerImage;
  };
  public shared ({ caller }) func setBannerImage(v : Text) : async () {
    bannerImage := v;
  };

  public query func getCompaniesJson() : async Text {
    companiesJson;
  };
  public shared ({ caller }) func setCompaniesJson(v : Text) : async () {
    companiesJson := v;
  };

  // ===== EMPLOYEES JSON (with full photo data) =====

  public query func getEmployeesJson() : async Text {
    employeesJson;
  };
  public shared ({ caller }) func setEmployeesJson(v : Text) : async () {
    employeesJson := v;
  };

  // ===== SERVICES JSON (with full image data) =====

  public query func getServicesJson() : async Text {
    servicesJson;
  };
  public shared ({ caller }) func setServicesJson(v : Text) : async () {
    servicesJson := v;
  };

  // ===== SERVICES CRUD =====

  public query func getAllServices() : async [Service] {
    ensureServicesMigrated();
    servicesV2.values().toArray();
  };

  public query func getService(id : Nat) : async ?Service {
    servicesV2.get(id);
  };

  public shared ({ caller }) func addService(s : Service) : async () {
    ensureServicesMigrated();
    servicesV2.add(s.id, s);
  };

  public shared ({ caller }) func updateService(id : Nat, s : Service) : async Bool {
    ensureServicesMigrated();
    if (servicesV2.containsKey(id)) {
      servicesV2.add(id, s);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async Bool {
    ensureServicesMigrated();
    if (servicesV2.containsKey(id)) {
      servicesV2.remove(id);
      true;
    } else { false };
  };

  // ===== EMPLOYEES CRUD =====

  public query func getAllEmployees() : async [Employee] {
    ensureEmployeesMigrated();
    employeesV2.values().toArray();
  };

  public query func getEmployee(id : Nat) : async ?Employee {
    employeesV2.get(id);
  };

  public shared ({ caller }) func addEmployee(e : Employee) : async () {
    ensureEmployeesMigrated();
    employeesV2.add(e.id, e);
  };

  public shared ({ caller }) func updateEmployee(id : Nat, e : Employee) : async Bool {
    ensureEmployeesMigrated();
    if (employeesV2.containsKey(id)) {
      employeesV2.add(id, e);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteEmployee(id : Nat) : async Bool {
    ensureEmployeesMigrated();
    if (employeesV2.containsKey(id)) {
      employeesV2.remove(id);
      true;
    } else { false };
  };

  // ===== REVIEWS CRUD =====

  public query func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public query func getReview(id : Nat) : async ?Review {
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

  public query func getApprovedReviews() : async [Review] {
    reviews.values().toArray().filter(func(r) { r.status == "approved" });
  };

  public query func getPendingReviews() : async [Review] {
    reviews.values().toArray().filter(func(r) { r.status == "pending" });
  };

  // ===== INVOICES CRUD (uses invoicesV2 for new Invoice type) =====

  public shared ({ caller }) func getAllInvoices() : async [Invoice] {
    ensureInvoicesMigrated();
    invoicesV2.values().toArray();
  };

  public shared ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    ensureInvoicesMigrated();
    invoicesV2.get(id);
  };

  public shared ({ caller }) func addInvoice(inv : Invoice) : async () {
    ensureInvoicesMigrated();
    invoicesV2.add(inv.id, inv);
  };

  public shared ({ caller }) func updateInvoice(id : Nat, inv : Invoice) : async Bool {
    ensureInvoicesMigrated();
    if (invoicesV2.containsKey(id)) {
      invoicesV2.add(id, inv);
      true;
    } else { false };
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async Bool {
    ensureInvoicesMigrated();
    if (invoicesV2.containsKey(id)) {
      invoicesV2.remove(id);
      true;
    } else { false };
  };

  public shared ({ caller }) func getInvoicesByCustomerPhone(phone : Text) : async [Invoice] {
    ensureInvoicesMigrated();
    let matchingInvoices = invoicesV2.toArray().filter(func((_, invoice)) { invoice.phone == phone });
    let invoiceArray = matchingInvoices.map(func((_, invoice)) { invoice });
    invoiceArray;
  };

  // ===== CUSTOMER ORDERS CRUD =====

  public query func getAllCustomerOrders() : async [CustomerOrder] {
    customerOrders.values().toArray();
  };

  public query func getCustomerOrder(id : Nat) : async ?CustomerOrder {
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

  public query func getOrdersByCustomer(customerId : Nat) : async [CustomerOrder] {
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

  public query func getAllContactMessages() : async [ContactMessage] {
    contactMessages.values().toArray();
  };

  public query func getContactMessage(id : Nat) : async ?ContactMessage {
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

  public query func getAllBillingItems() : async [BillingItem] {
    billingItems.values().toArray();
  };

  public query func getBillingItem(id : Nat) : async ?BillingItem {
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

  public query func getAllBillingCustomers() : async [BillingCustomer] {
    billingCustomers.values().toArray();
  };

  public query func getBillingCustomer(id : Nat) : async ?BillingCustomer {
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

  public query func getAboutStats() : async ?AboutStats {
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

  public query func getCustomerById(id : Nat) : async ?CustomerAccount {
    customers.get(id);
  };

  public query func getCustomerByEmail(email : Text) : async ?CustomerAccount {
    let customer = customers.toArray().find(
      func((_, account)) { account.email == email }
    );
    switch (customer) {
      case (null) { null };
      case (?(id, c)) { ?c };
    };
  };

  public query func getAllCustomers() : async [CustomerAccount] {
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

  public query func getSecurityAnswers() : async SecurityAnswers {
    securityAnswers;
  };
};
