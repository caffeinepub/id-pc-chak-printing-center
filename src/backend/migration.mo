import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  // ===== Type Definitions ====
  type OldInvoiceItem = {
    srNo : Nat;
    particular : Text;
    quantity : Text;
    quality : Text;
    rate : Nat;
    total : Nat;
  };

  type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Text;
  };

  type OldEmployee = {
    id : Nat;
    fullName : Text;
    fatherName : Text;
    age : Nat;
    cnic : Text;
    mobile : Text;
    bloodGroup : Text;
    photo : Text;
    designation : Text;
  };

  type OldReview = {
    id : Nat;
    customerName : Text;
    review : Text;
    rating : Nat;
    date : Text;
  };

  type OldInvoice = {
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
    items : [OldInvoiceItem];
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

  type OldContactMessage = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    date : Text;
    isRead : Bool;
  };

  type OldActor = {
    logo : Text;
    bannerImage : Text;
    adminPassword : Text;
    services : Map.Map<Nat, OldService>;
    employees : Map.Map<Nat, OldEmployee>;
    reviews : Map.Map<Nat, OldReview>;
    invoices : Map.Map<Nat, OldInvoice>;
    customerOrders : Map.Map<Nat, OldCustomerOrder>;
    contactMessages : Map.Map<Nat, OldContactMessage>;
  };

  // ===== New Migration Types =====

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

  type NewActor = {
    logo : Text;
    adminPassword : Text;
    services : Map.Map<Nat, Service>;
    employees : Map.Map<Nat, Employee>;
    reviews : Map.Map<Nat, Review>;
    invoices : Map.Map<Nat, Invoice>;
    customerOrders : Map.Map<Nat, CustomerOrder>;
    contactMessages : Map.Map<Nat, ContactMessage>;
    billingItems : Map.Map<Nat, BillingItem>;
    aboutStats : ?AboutStats;
  };

  public func run(old : OldActor) : NewActor {
    let newServices = old.services.map<Nat, OldService, Service>(
      func(_id, oldService) {
        {
          oldService with
          image = "";
          inStock = true;
          discount = 0;
        };
      }
    );

    let newEmployees = old.employees.map<Nat, OldEmployee, Employee>(
      func(_id, oldEmployee) {
        { oldEmployee with
          photo = "";
        };
      }
    );

    let newInvoiceItems = func(oldItems : [OldInvoiceItem]) : [InvoiceItem] {
      oldItems.map(
        func(oldItem) {
          { oldItem with billingItemId = 0 };
        }
      );
    };

    let newInvoices = old.invoices.map<Nat, OldInvoice, Invoice>(
      func(_id, oldInvoice) {
        {
          id = oldInvoice.id;
          customerName = oldInvoice.customerName;
          phone = oldInvoice.phone;
          address = oldInvoice.address;
          date = oldInvoice.date;
          grandTotal = oldInvoice.grandTotal;
          advance = oldInvoice.advance;
          balance = oldInvoice.balance;
          discount = oldInvoice.discount;
          items = newInvoiceItems(oldInvoice.items);
        };
      }
    );

    let newReviews = old.reviews.map<Nat, OldReview, Review>(
      func(_id, oldReview) {
        {
          oldReview with
          status = "approved";
        };
      }
    );

    {
      logo = old.logo;
      adminPassword = old.adminPassword;
      services = newServices;
      employees = newEmployees;
      reviews = newReviews;
      invoices = newInvoices;
      customerOrders = old.customerOrders;
      contactMessages = old.contactMessages;
      billingItems = Map.empty<Nat, BillingItem>();
      aboutStats = null;
    };
  };
};
