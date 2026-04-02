import Map "mo:core/Map";

module {
  // ===== Old types (from previous version) =====

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
    price : Nat;
    icon : Text;
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
    terms : Nat;
    items : [OldInvoiceItem];
  };

  type OldActor = {
    bannerImage : Text;
    logo : Text;
    adminPassword : Text;
    services : Map.Map<Nat, OldService>;
    employees : Map.Map<Nat, OldEmployee>;
    reviews : Map.Map<Nat, OldReview>;
    invoices : Map.Map<Nat, OldInvoice>;
  };

  // ===== New types (matching main.mo exactly) =====

  type NewInvoiceItem = {
    srNo : Nat;
    particular : Text;
    quantity : Text;
    quality : Text;
    rate : Nat;
    total : Nat;
  };

  type NewService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    icon : Text;
    image : Text;
  };

  type NewEmployee = {
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

  type NewReview = {
    id : Nat;
    customerName : Text;
    review : Text;
    rating : Nat;
    date : Text;
  };

  type NewInvoice = {
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
    items : [NewInvoiceItem];
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
  };

  type NewContactMessage = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    date : Text;
    isRead : Bool;
  };

  type NewActor = {
    bannerImage : Text;
    logo : Text;
    adminPassword : Text;
    services : Map.Map<Nat, NewService>;
    employees : Map.Map<Nat, NewEmployee>;
    reviews : Map.Map<Nat, NewReview>;
    invoices : Map.Map<Nat, NewInvoice>;
    customerOrders : Map.Map<Nat, NewCustomerOrder>;
    contactMessages : Map.Map<Nat, NewContactMessage>;
  };

  public func run(old : OldActor) : NewActor {
    // Migrate services: price was Nat, now Text; add empty image field
    let newServices = old.services.map<Nat, OldService, NewService>(
      func(_id, s) {
        {
          id = s.id;
          name = s.name;
          description = s.description;
          price = "Rs " # s.price.toText();
          icon = s.icon;
          image = "";
        };
      }
    );

    // Migrate employees: same fields, no changes needed
    let newEmployees = old.employees.map<Nat, OldEmployee, NewEmployee>(
      func(_id, e) { e }
    );

    // Migrate reviews: identical
    let newReviews = old.reviews.map<Nat, OldReview, NewReview>(
      func(_id, r) { r }
    );

    // Migrate invoices: add discount field (default 0), keep all other fields
    let newInvoices = old.invoices.map<Nat, OldInvoice, NewInvoice>(
      func(_id, inv) {
        {
          id = inv.id;
          userId = inv.userId;
          customerName = inv.customerName;
          phone = inv.phone;
          address = inv.address;
          date = inv.date;
          grandTotal = inv.grandTotal;
          advance = inv.advance;
          balance = inv.balance;
          discount = 0;
          items = inv.items;
        };
      }
    );

    // New collections start empty
    let customerOrders = Map.empty<Nat, NewCustomerOrder>();
    let contactMessages = Map.empty<Nat, NewContactMessage>();

    {
      bannerImage = old.bannerImage;
      logo = old.logo;
      adminPassword = old.adminPassword;
      services = newServices;
      employees = newEmployees;
      reviews = newReviews;
      invoices = newInvoices;
      customerOrders;
      contactMessages;
    };
  };
};
