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

  type OldCustomerOrder = {
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

  type NewCustomerOrder = {
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
    customerOrders : Map.Map<Nat, OldCustomerOrder>;
    contactMessages : Map.Map<Nat, ContactMessage>;
    billingItems : Map.Map<Nat, BillingItem>;
    aboutStats : ?AboutStats;
  };

  type NewActor = {
    logo : Text;
    adminPassword : Text;
    services : Map.Map<Nat, Service>;
    employees : Map.Map<Nat, Employee>;
    reviews : Map.Map<Nat, Review>;
    invoices : Map.Map<Nat, Invoice>;
    customerOrders : Map.Map<Nat, NewCustomerOrder>;
    contactMessages : Map.Map<Nat, ContactMessage>;
    billingItems : Map.Map<Nat, BillingItem>;
    aboutStats : ?AboutStats;
    customers : Map.Map<Nat, CustomerAccount>;
    securityAnswers : SecurityAnswers;
  };

  public func run(old : OldActor) : NewActor {
    let newCustomerOrders = old.customerOrders.map<Nat, OldCustomerOrder, NewCustomerOrder>(
      func(_id, oldCustomerOrder) {
        { oldCustomerOrder with customerId = null };
      }
    );
    {
      old with
      customerOrders = newCustomerOrders;
      customers = Map.empty<Nat, CustomerAccount>();
      securityAnswers = {
        answer1 = "24-07-2004";
        answer2 = "4330384851864";
        answer3 = "03113639008";
      };
    };
  };
};
