import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
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

  type OldActor = {
    logo : Text;
    adminPassword : Text;
    services : Map.Map<Nat, Service>;
    employees : Map.Map<Nat, Employee>;
    reviews : Map.Map<Nat, Review>;
    invoices : Map.Map<Nat, Invoice>;
    customerOrders : Map.Map<Nat, CustomerOrder>;
    contactMessages : Map.Map<Nat, ContactMessage>;
    billingItems : Map.Map<Nat, BillingItem>;
    customers : Map.Map<Nat, CustomerAccount>;
    aboutStats : ?AboutStats;
    securityAnswers : SecurityAnswers;
  };

  type NewActor = {
    logo : Text;
    bannerImage : Text;
    companiesJson : Text;
    adminPassword : Text;
    services : Map.Map<Nat, Service>;
    employees : Map.Map<Nat, Employee>;
    reviews : Map.Map<Nat, Review>;
    invoices : Map.Map<Nat, Invoice>;
    customerOrders : Map.Map<Nat, CustomerOrder>;
    contactMessages : Map.Map<Nat, ContactMessage>;
    billingItems : Map.Map<Nat, BillingItem>;
    billingCustomers : Map.Map<Nat, BillingCustomer>;
    customers : Map.Map<Nat, CustomerAccount>;
    aboutStats : ?AboutStats;
    securityAnswers : SecurityAnswers;
  };

  public func run(old : OldActor) : NewActor {
    {
      logo = old.logo;
      bannerImage = "";
      companiesJson = "";
      adminPassword = old.adminPassword;
      services = old.services;
      employees = old.employees;
      reviews = old.reviews;
      invoices = old.invoices;
      customerOrders = old.customerOrders;
      contactMessages = old.contactMessages;
      billingItems = old.billingItems;
      billingCustomers = Map.empty<Nat, BillingCustomer>();
      customers = old.customers;
      aboutStats = old.aboutStats;
      securityAnswers = old.securityAnswers;
    };
  };
};
