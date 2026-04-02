import InvoiceView from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  useContactMessages,
  useInvalidate,
  useInvoices,
  useOrders,
} from "@/hooks/useQueries";
import {
  backendAddEmployee,
  backendAddInvoice,
  backendAddReview,
  backendAddService,
  backendDeleteContactMessage,
  backendDeleteEmployee,
  backendDeleteInvoice,
  backendDeleteOrder,
  backendDeleteReview,
  backendDeleteService,
  backendMarkMessageRead,
  backendUpdateEmployee,
  backendUpdateInvoice,
  backendUpdateOrder,
  backendUpdateService,
  saveBannerImage,
  saveLogo,
} from "@/lib/backendData";
import {
  type Employee,
  type Invoice,
  type InvoiceItem,
  type Review,
  type Service,
  getBannerImage,
  getEmployees,
  getLogo,
  getNextInvoiceNumber,
  getNextUserId,
  getReviews,
  getServices,
  saveEmployees,
  saveReviews,
  saveServices,
} from "@/lib/storage";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Eye,
  FileText,
  Image,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  PlusCircle,
  Printer,
  Send,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_TERMS = `1. Payment is due within 7 days of invoice date.
2. No refund or cancellation after printing starts.
3. Customer is responsible for proofreading content.
4. ID&PC Chak is not liable for errors approved by customer.
5. Advance payment is non-refundable.`;

const DEFAULT_ITEMS = () => [
  { rowId: "row-1", particular: "", quantity: 1, quality: "", rate: 0 },
  { rowId: "row-2", particular: "", quantity: 1, quality: "", rate: 0 },
  { rowId: "row-3", particular: "", quantity: 1, quality: "", rate: 0 },
];

type Tab =
  | "invoices"
  | "orders"
  | "messages"
  | "reviews"
  | "employees"
  | "services"
  | "banner"
  | "logo";
type View = "list" | "create" | "view-invoice";

interface ItemRow extends Omit<InvoiceItem, "srNo" | "total"> {
  rowId: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ORDER_STATUSES = ["pending", "confirmed", "completed"];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const invalidate = useInvalidate();
  const [tab, setTab] = useState<Tab>("invoices");
  const [view, setView] = useState<View>("list");
  const { data: invoices = [] } = useInvoices();
  const { data: orders = [] } = useOrders();
  const { data: contactMessages = [] } = useContactMessages();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Invoice form
  const [form, setForm] = useState({
    customerName: "",
    userId: "",
    phone: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    terms: DEFAULT_TERMS,
    advance: 0,
    discountPct: 0,
  });
  const [items, setItems] = useState<ItemRow[]>(DEFAULT_ITEMS());

  // Review form
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    review: "",
    rating: 5,
  });

  // Employee form
  const emptyEmp = {
    fullName: "",
    fatherName: "",
    age: "",
    cnic: "",
    mobile: "",
    bloodGroup: "A+",
    photo: "",
    designation: "",
  };
  const [empForm, setEmpForm] = useState(emptyEmp);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const empPhotoRef = useRef<HTMLInputElement>(null);

  // Service form
  const emptySvc = {
    name: "",
    description: "",
    price: "",
    icon: "🖨️",
    image: "",
  };
  const [svcForm, setSvcForm] = useState(emptySvc);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const svcImageRef = useRef<HTMLInputElement>(null);

  // Banner
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Unread message count
  const unreadCount = contactMessages.filter((m) => !m.isRead).length;

  useEffect(() => {
    document.title = "Admin Dashboard - ID&PC Chak";
    if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate({ to: "/admin", replace: true });
      return;
    }
    setReviews(getReviews());
    setEmployees(getEmployees());
    setServices(getServices());
    setBannerPreview(getBannerImage());
    setLogoPreview(getLogo());
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("isAdminLoggedIn");
    navigate({ to: "/admin" });
  }

  // Invoice helpers
  const computedItems: InvoiceItem[] = items.map((item, i) => ({
    srNo: i + 1,
    particular: item.particular,
    quantity: item.quantity,
    quality: item.quality,
    rate: item.rate,
    total: item.quantity * item.rate,
  }));
  const subtotal = computedItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount =
    Math.round(((subtotal * form.discountPct) / 100) * 100) / 100;
  const grandTotal = subtotal - discountAmount;
  const balance = grandTotal - form.advance;

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        rowId: `row-${Date.now()}`,
        particular: "",
        quantity: 1,
        quality: "",
        rate: 0,
      },
    ]);
  }
  function removeItem(rowId: string) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.rowId !== rowId));
  }
  function updateItem(rowId: string, field: string, value: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, [field]: value } : item,
      ),
    );
  }

  function resetInvoiceForm() {
    setForm({
      customerName: "",
      userId: "",
      phone: "",
      address: "",
      date: new Date().toISOString().split("T")[0],
      terms: DEFAULT_TERMS,
      advance: 0,
      discountPct: 0,
    });
    setItems(DEFAULT_ITEMS());
    setEditingInvoice(null);
  }

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (editingInvoice) {
      const updated: Invoice = {
        ...editingInvoice,
        customerName: form.customerName,
        userId: form.userId || editingInvoice.userId,
        phone: form.phone,
        address: form.address,
        date: form.date,
        items: computedItems,
        grandTotal,
        advance: form.advance,
        balance,
        discount: discountAmount,
        terms: form.terms,
      };
      await backendUpdateInvoice(actor, updated);
      invalidate(["invoices"]);
      setSelectedInvoice(updated);
      setEditingInvoice(null);
      setView("view-invoice");
    } else {
      const invoice: Invoice = {
        id: getNextInvoiceNumber(),
        userId: form.userId || getNextUserId(),
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        date: form.date,
        items: computedItems,
        grandTotal,
        advance: form.advance,
        balance,
        discount: discountAmount,
        terms: form.terms,
      };
      await backendAddInvoice(actor, invoice);
      invalidate(["invoices"]);
      setSelectedInvoice(invoice);
      setView("view-invoice");
    }
  }

  function handleEditInvoice(inv: Invoice) {
    setEditingInvoice(inv);
    setForm({
      customerName: inv.customerName,
      userId: inv.userId,
      phone: inv.phone,
      address: inv.address,
      date: inv.date,
      terms: inv.terms,
      advance: inv.advance,
      discountPct: 0,
    });
    setItems(
      inv.items.map((item) => ({
        rowId: `row-${item.srNo}`,
        particular: item.particular,
        quantity: item.quantity,
        quality: item.quality,
        rate: item.rate,
      })),
    );
    setView("create");
  }

  async function handleDeleteInvoice(inv: Invoice) {
    if (
      window.confirm(
        `Delete invoice ${inv.id} for ${inv.customerName}? This cannot be undone.`,
      )
    ) {
      await backendDeleteInvoice(actor, inv.id);
      invalidate(["invoices"]);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.review.trim()) return;
    const newReview = await backendAddReview(actor, reviewForm);
    setReviews((prev) => {
      const updated = [...prev, newReview];
      saveReviews(updated);
      return updated;
    });
    setReviewForm({ customerName: "", review: "", rating: 5 });
    invalidate(["reviews"]);
  }

  async function handleDeleteReview(id: string) {
    if (window.confirm("Delete this review?")) {
      await backendDeleteReview(actor, id);
      setReviews((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        saveReviews(updated);
        return updated;
      });
      invalidate(["reviews"]);
    }
  }

  // Employee helpers
  function handleEmpPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setEmpForm((p) => ({ ...p, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (editingEmp) {
      const updated = { ...empForm, id: editingEmp.id };
      await backendUpdateEmployee(actor, updated);
      setEmployees((prev) => {
        const list = prev.map((em) => (em.id === editingEmp.id ? updated : em));
        saveEmployees(list);
        return list;
      });
    } else {
      const newEmp = await backendAddEmployee(actor, empForm);
      setEmployees((prev) => {
        const list = [...prev, newEmp];
        saveEmployees(list);
        return list;
      });
    }
    setEmpForm(emptyEmp);
    setEditingEmp(null);
    if (empPhotoRef.current) empPhotoRef.current.value = "";
    invalidate(["employees"]);
  }

  function handleEditEmp(emp: Employee) {
    setEditingEmp(emp);
    setEmpForm({
      fullName: emp.fullName,
      fatherName: emp.fatherName,
      age: emp.age,
      cnic: emp.cnic,
      mobile: emp.mobile,
      bloodGroup: emp.bloodGroup,
      photo: emp.photo,
      designation: emp.designation,
    });
  }

  async function handleDeleteEmp(id: string) {
    if (window.confirm("Delete this employee? This cannot be undone.")) {
      await backendDeleteEmployee(actor, id);
      setEmployees((prev) => {
        const list = prev.filter((em) => em.id !== id);
        saveEmployees(list);
        return list;
      });
      invalidate(["employees"]);
    }
  }

  // Service helpers
  function handleSvcImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setSvcForm((p) => ({ ...p, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    if (editingSvc) {
      const updated = { ...svcForm, id: editingSvc.id };
      await backendUpdateService(actor, updated);
      setServices((prev) => {
        const list = prev.map((s) => (s.id === editingSvc.id ? updated : s));
        saveServices(list);
        return list;
      });
    } else {
      const newSvc = await backendAddService(actor, svcForm);
      setServices((prev) => {
        const list = [...prev, newSvc];
        saveServices(list);
        return list;
      });
    }
    setSvcForm(emptySvc);
    setEditingSvc(null);
    if (svcImageRef.current) svcImageRef.current.value = "";
    invalidate(["services"]);
  }

  function handleEditSvc(svc: Service) {
    setEditingSvc(svc);
    setSvcForm({
      name: svc.name,
      description: svc.description,
      price: svc.price,
      icon: svc.icon,
      image: svc.image || "",
    });
  }

  async function handleDeleteSvc(id: string) {
    if (window.confirm("Delete this service?")) {
      await backendDeleteService(actor, id);
      setServices((prev) => {
        const list = prev.filter((s) => s.id !== id);
        saveServices(list);
        return list;
      });
      invalidate(["services"]);
    }
  }

  // Order helpers
  async function handleDeleteOrder(id: string) {
    if (window.confirm("Delete this order?")) {
      await backendDeleteOrder(actor, id);
      invalidate(["orders"]);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    await backendUpdateOrder(actor, { ...order, status: newStatus });
    invalidate(["orders"]);
  }

  // Message helpers
  async function handleMarkMessageRead(id: string) {
    await backendMarkMessageRead(actor, id);
    invalidate(["contactMessages"]);
  }

  async function handleDeleteMessage(id: string) {
    if (window.confirm("Delete this message?")) {
      await backendDeleteContactMessage(actor, id);
      invalidate(["contactMessages"]);
    }
  }

  // Logo helpers
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveLogo() {
    if (!logoPreview) return;
    await saveLogo(actor, logoPreview);
    invalidate(["logo"]);
    alert(
      "Logo updated successfully! It will now appear everywhere on the website and invoices.",
    );
  }

  // Banner helpers
  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveBanner() {
    if (!bannerPreview) return;
    await saveBannerImage(actor, bannerPreview);
    invalidate(["bannerImage"]);
    alert("Homepage banner image updated successfully!");
  }

  const TABS: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      key: "invoices",
      label: "Invoices",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: orders.filter((o) => o.status === "pending").length || undefined,
    },
    {
      key: "messages",
      label: "Messages",
      icon: <Mail className="w-4 h-4" />,
      badge: unreadCount || undefined,
    },
    {
      key: "reviews",
      label: "Reviews",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      key: "employees",
      label: "Employees",
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "services",
      label: "Services",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "banner",
      label: "Banner Image",
      icon: <Image className="w-4 h-4" />,
    },
    {
      key: "logo",
      label: "Logo",
      icon: <Image className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-brand-blue text-white px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-md no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center">
            <span className="text-brand-blue font-heading font-bold text-xs">
              ID&PC
            </span>
          </div>
          <div>
            <p className="font-heading font-bold text-sm">Admin Panel</p>
            <p className="text-white/60 text-xs">
              Ihsan Designing & Printing Center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => setTab("messages")}
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={`${unreadCount} unread message(s)`}
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            </button>
          )}
          <Button
            onClick={logout}
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {view === "list" && (
          <div className="flex flex-wrap gap-2 mb-6 no-print">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                  tab === t.key
                    ? "bg-brand-blue text-white"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
                data-ocid={`admin.${t.key}.tab`}
              >
                {t.icon} {t.label}
                {t.badge && t.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}

        {/* ===== INVOICES TAB ===== */}
        {view === "list" && tab === "invoices" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-blue">
                  Invoices
                </h1>
                <p className="text-muted-foreground text-sm">
                  {invoices.length} invoices total
                </p>
              </div>
              <Button
                onClick={() => {
                  resetInvoiceForm();
                  setView("create");
                }}
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                data-ocid="admin.invoices.primary_button"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Create New Invoice
              </Button>
            </div>
            {invoices.length === 0 ? (
              <Card
                className="border-dashed border-2"
                data-ocid="admin.invoices.empty_state"
              >
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No invoices yet. Create your first invoice!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-brand-blue text-white">
                        <th className="text-left p-4">Invoice #</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">User ID</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-right p-4">Amount</th>
                        <th className="text-center p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, i) => (
                        <tr
                          key={inv.id}
                          className="border-b border-border hover:bg-muted/40 transition-colors"
                          data-ocid={`admin.invoices.row.${i + 1}`}
                        >
                          <td className="p-4 font-semibold text-brand-blue">
                            {inv.id}
                          </td>
                          <td className="p-4">{inv.customerName}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {inv.userId}
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {inv.date}
                          </td>
                          <td className="p-4 text-right font-bold text-brand-gold">
                            Rs {inv.grandTotal.toFixed(0)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setView("view-invoice");
                                }}
                                className="border-brand-blue-mid text-brand-blue hover:bg-brand-blue hover:text-white h-8 px-2"
                                title="View"
                                data-ocid={`admin.invoices.edit_button.${i + 1}`}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditInvoice(inv)}
                                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white h-8 px-2"
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteInvoice(inv)}
                                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                                title="Delete"
                                data-ocid={`admin.invoices.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setView("view-invoice");
                                  setTimeout(() => window.print(), 400);
                                }}
                                className="border-gray-400 text-gray-600 hover:bg-gray-100 h-8 px-2"
                                title="Print"
                              >
                                <Printer className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  alert(
                                    `Invoice ${inv.id} for ${inv.customerName}\nUser ID: ${inv.userId}\n\nShare the User ID and Invoice Number with the customer so they can view it on the Bill Check page.`,
                                  )
                                }
                                className="border-green-500 text-green-600 hover:bg-green-50 h-8 px-2"
                                title="Send"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {view === "list" && tab === "orders" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Customer Orders
              </h1>
              <p className="text-muted-foreground text-sm">
                {orders.length} orders total •{" "}
                {orders.filter((o) => o.status === "pending").length} pending
              </p>
            </div>
            {orders.length === 0 ? (
              <Card
                className="border-dashed border-2"
                data-ocid="admin.orders.empty_state"
              >
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No customer orders yet. Orders placed from the Products page
                    will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-blue text-white">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Phone</th>
                        <th className="text-left p-3">Service</th>
                        <th className="text-center p-3">Qty</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <tr
                          key={order.id}
                          className="border-b border-border hover:bg-muted/40 transition-colors"
                          data-ocid={`admin.orders.row.${i + 1}`}
                        >
                          <td className="p-3 text-muted-foreground">
                            {order.date}
                          </td>
                          <td className="p-3 font-semibold">
                            {order.customerName}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {order.phone}
                          </td>
                          <td className="p-3">{order.serviceName}</td>
                          <td className="p-3 text-center">{order.quantity}</td>
                          <td className="p-3 text-right font-bold text-brand-gold">
                            {order.totalPrice > 0
                              ? `Rs ${order.totalPrice.toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value,
                                )
                              }
                              className={`border rounded px-2 py-1 text-xs font-semibold cursor-pointer ${
                                order.status === "pending"
                                  ? "border-yellow-400 text-yellow-700 bg-yellow-50"
                                  : order.status === "confirmed"
                                    ? "border-blue-400 text-blue-700 bg-blue-50"
                                    : "border-green-400 text-green-700 bg-green-50"
                              }`}
                              data-ocid={`admin.orders.select.${i + 1}`}
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-7 px-2"
                              title="Delete"
                              data-ocid={`admin.orders.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ===== MESSAGES TAB ===== */}
        {view === "list" && tab === "messages" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center gap-3">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-blue">
                  Contact Messages
                </h1>
                <p className="text-muted-foreground text-sm">
                  {contactMessages.length} messages • {unreadCount} unread
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {contactMessages.length === 0 ? (
              <Card
                className="border-dashed border-2"
                data-ocid="admin.messages.empty_state"
              >
                <CardContent className="p-12 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No contact messages yet. Messages from the Contact page will
                    appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contactMessages.map((msg, i) => (
                  <Card
                    key={msg.id}
                    className={`border-2 shadow-card transition-colors ${
                      !msg.isRead
                        ? "border-brand-gold/60 bg-brand-gold/5"
                        : "border-border"
                    }`}
                    data-ocid={`admin.messages.item.${i + 1}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-brand-blue">
                              {msg.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {msg.phone}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {msg.date}
                            </span>
                            {!msg.isRead && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!msg.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="border-green-500 text-green-600 hover:bg-green-50 h-8 px-2 text-xs"
                              title="Mark as read"
                              data-ocid={`admin.messages.confirm_button.${i + 1}`}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                            title="Delete"
                            data-ocid={`admin.messages.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== REVIEWS TAB ===== */}
        {view === "list" && tab === "reviews" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Customer Reviews
              </h1>
              <p className="text-muted-foreground text-sm">
                Add reviews from real customers. They appear on the Home page.
              </p>
            </div>
            <Card className="border-2 border-border shadow-card mb-8">
              <CardHeader>
                <CardTitle className="text-brand-blue">
                  Add New Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Customer Name *
                      </Label>
                      <Input
                        value={reviewForm.customerName}
                        onChange={(e) =>
                          setReviewForm((p) => ({
                            ...p,
                            customerName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Muhammad Ali"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Rating (1-5 Stars) *
                      </Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setReviewForm((p) => ({ ...p, rating: n }))
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${n <= reviewForm.rating ? "fill-brand-gold text-brand-gold" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      Review Text *
                    </Label>
                    <Textarea
                      value={reviewForm.review}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, review: e.target.value }))
                      }
                      placeholder="Write the customer's review here..."
                      required
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Review
                  </Button>
                </form>
              </CardContent>
            </Card>
            {reviews.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews added yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <Card
                    key={r.id}
                    className="border-2 border-border shadow-card"
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-brand-blue">
                            {r.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.date}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReview(r.id)}
                          className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: r.rating }).map((_, si) => (
                          <Star
                            key={`rs-${r.id}-${si}`}
                            className="w-4 h-4 fill-brand-gold text-brand-gold"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm italic">
                        "{r.review}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== EMPLOYEES TAB ===== */}
        {view === "list" && tab === "employees" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Employee Management
              </h1>
              <p className="text-muted-foreground text-sm">
                {employees.length} employees • Changes reflect instantly on the
                About page
              </p>
            </div>

            {/* Add / Edit Employee Form */}
            <Card className="border-2 border-border shadow-card mb-8">
              <CardHeader>
                <CardTitle className="text-brand-blue">
                  {editingEmp ? "Edit Employee" : "Add New Employee"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Full Name *
                      </Label>
                      <Input
                        value={empForm.fullName}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Muhammad Kamran"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Father's Name *
                      </Label>
                      <Input
                        value={empForm.fatherName}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            fatherName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Muhammad Ali"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Age *
                      </Label>
                      <Input
                        type="number"
                        min="16"
                        max="80"
                        value={empForm.age}
                        onChange={(e) =>
                          setEmpForm((p) => ({ ...p, age: e.target.value }))
                        }
                        placeholder="e.g. 28"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        CNIC Number *
                      </Label>
                      <Input
                        value={empForm.cnic}
                        onChange={(e) =>
                          setEmpForm((p) => ({ ...p, cnic: e.target.value }))
                        }
                        placeholder="e.g. 43201-1234567-1"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Mobile Number *
                      </Label>
                      <Input
                        value={empForm.mobile}
                        onChange={(e) =>
                          setEmpForm((p) => ({ ...p, mobile: e.target.value }))
                        }
                        placeholder="e.g. +92 300 1234567"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Blood Group *
                      </Label>
                      <select
                        value={empForm.bloodGroup}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            bloodGroup: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                        required
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Designation / Job Role *
                      </Label>
                      <Input
                        value={empForm.designation}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            designation: e.target.value,
                          }))
                        }
                        placeholder="e.g. Senior Designer"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Profile Picture
                      </Label>
                      <Input
                        ref={empPhotoRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEmpPhoto}
                        className="mt-1"
                      />
                      {empForm.photo && (
                        <img
                          src={empForm.photo}
                          alt="preview"
                          className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-brand-gold"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                    >
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {editingEmp ? "Update Employee" : "Add Employee"}
                    </Button>
                    {editingEmp && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingEmp(null);
                          setEmpForm(emptyEmp);
                          if (empPhotoRef.current)
                            empPhotoRef.current.value = "";
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Employee List */}
            {employees.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No employees added yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((emp) => (
                  <Card
                    key={emp.id}
                    className="border-2 border-border shadow-card"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {emp.photo ? (
                          <img
                            src={emp.photo}
                            alt={emp.fullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-brand-gold flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">
                              {emp.fullName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-brand-blue text-lg">
                                {emp.fullName}
                              </p>
                              <p className="text-brand-gold font-semibold text-sm">
                                {emp.designation}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEmp(emp)}
                                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white h-8 px-2"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteEmp(emp.id)}
                                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              <strong>Father:</strong> {emp.fatherName}
                            </span>
                            <span>
                              <strong>Age:</strong> {emp.age}
                            </span>
                            <span>
                              <strong>CNIC:</strong> {emp.cnic}
                            </span>
                            <span>
                              <strong>Mobile:</strong> {emp.mobile}
                            </span>
                            <span>
                              <strong>Blood Group:</strong> {emp.bloodGroup}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== SERVICES TAB ===== */}
        {view === "list" && tab === "services" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Services Management
              </h1>
              <p className="text-muted-foreground text-sm">
                {services.length} services • Changes reflect instantly on the
                Homepage and Products page
              </p>
            </div>

            <Card className="border-2 border-border shadow-card mb-8">
              <CardHeader>
                <CardTitle className="text-brand-blue">
                  {editingSvc ? "Edit Service" : "Add New Service"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveService} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Service Name *
                      </Label>
                      <Input
                        value={svcForm.name}
                        onChange={(e) =>
                          setSvcForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. T-Shirt Printing"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Price *
                      </Label>
                      <Input
                        value={svcForm.price}
                        onChange={(e) =>
                          setSvcForm((p) => ({ ...p, price: e.target.value }))
                        }
                        placeholder="e.g. Rs 500 per shirt"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Icon (Emoji)
                      </Label>
                      <Input
                        value={svcForm.icon}
                        onChange={(e) =>
                          setSvcForm((p) => ({ ...p, icon: e.target.value }))
                        }
                        placeholder="e.g. 👕"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Product Image (optional)
                      </Label>
                      <Input
                        ref={svcImageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSvcImage}
                        className="mt-1"
                        data-ocid="admin.services.upload_button"
                      />
                      {svcForm.image && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={svcForm.image}
                            alt="Service preview"
                            className="w-24 h-24 rounded-lg object-cover border-2 border-brand-gold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSvcForm((p) => ({ ...p, image: "" }))
                            }
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Shown on the Products page and Purchase page.
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-brand-blue font-semibold">
                        Description *
                      </Label>
                      <Textarea
                        value={svcForm.description}
                        onChange={(e) =>
                          setSvcForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Short description of the service..."
                        required
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                      data-ocid="admin.services.submit_button"
                    >
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {editingSvc ? "Update Service" : "Add Service"}
                    </Button>
                    {editingSvc && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingSvc(null);
                          setSvcForm(emptySvc);
                          if (svcImageRef.current)
                            svcImageRef.current.value = "";
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <Card
                  key={svc.id}
                  className="border-2 border-border shadow-card overflow-hidden"
                >
                  {svc.image && (
                    <img
                      src={svc.image}
                      alt={svc.name}
                      className="w-full h-28 object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{svc.icon}</span>
                          <p className="font-bold text-brand-blue">
                            {svc.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {svc.description}
                        </p>
                        <span className="inline-block bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded text-xs font-bold">
                          {svc.price}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSvc(svc)}
                          className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white h-8 px-2"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSvc(svc.id)}
                          className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ===== BANNER IMAGE TAB ===== */}
        {view === "list" && tab === "banner" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Homepage Banner Image
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload a new image to replace the homepage hero banner.
              </p>
            </div>
            <Card className="border-2 border-border shadow-card max-w-2xl">
              <CardContent className="p-6 space-y-5">
                {bannerPreview && (
                  <div>
                    <p className="text-sm font-semibold text-brand-blue mb-2">
                      Current Banner:
                    </p>
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full rounded-lg object-cover max-h-64 border border-border"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-brand-blue font-semibold">
                    Upload New Banner Image
                  </Label>
                  <Input
                    ref={bannerRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="mt-1"
                    data-ocid="admin.banner.upload_button"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: wide landscape image (1920×600px)
                  </p>
                </div>
                <Button
                  onClick={handleSaveBanner}
                  className="bg-brand-blue text-white hover:bg-brand-blue-dark w-full"
                  data-ocid="admin.banner.save_button"
                >
                  <Image className="w-4 h-4 mr-2" /> Save Banner Image
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view === "list" && tab === "logo" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Logo Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload a new logo. It will automatically update everywhere on
                the website and on all invoices.
              </p>
            </div>
            <Card className="border-2 border-border shadow-card max-w-2xl">
              <CardContent className="p-6 space-y-5">
                {logoPreview && (
                  <div>
                    <p className="text-sm font-semibold text-brand-blue mb-2">
                      Current Logo:
                    </p>
                    <div className="bg-brand-blue p-4 rounded-lg inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-brand-blue font-semibold">
                    Upload New Logo
                  </Label>
                  <Input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-1"
                    data-ocid="admin.logo.upload_button"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: PNG with transparent background, square or wide
                    format.
                  </p>
                </div>
                <Button
                  onClick={handleSaveLogo}
                  className="bg-brand-blue text-white hover:bg-brand-blue-dark w-full"
                  data-ocid="admin.logo.save_button"
                >
                  <Image className="w-4 h-4 mr-2" /> Save Logo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CREATE / EDIT INVOICE FORM ===== */}
        {view === "create" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetInvoiceForm();
                  setView("list");
                }}
              >
                ← Back
              </Button>
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                {editingInvoice
                  ? `Edit Invoice ${editingInvoice.id}`
                  : "Create New Invoice"}
              </h1>
            </div>
            <form onSubmit={handleSaveInvoice} className="space-y-6">
              <Card className="border-2 border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-brand-blue">
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      Customer Name *
                    </Label>
                    <Input
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, customerName: e.target.value }))
                      }
                      placeholder="Full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      User ID
                    </Label>
                    <Input
                      value={form.userId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, userId: e.target.value }))
                      }
                      placeholder="Auto-generated if empty"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="e.g. +92 300 1234567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      Invoice Date
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-brand-blue font-semibold">
                      Address
                    </Label>
                    <Input
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="Customer address"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-brand-blue">
                    Invoice Items
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addItem}
                    className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Row
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted border-b">
                          <th className="text-left p-2 w-10">Sr#</th>
                          <th className="text-left p-2">Particular</th>
                          <th className="text-left p-2 w-20">Qty</th>
                          <th className="text-left p-2 w-36">
                            Quality (free text)
                          </th>
                          <th className="text-left p-2 w-24">Rate (Rs)</th>
                          <th className="text-right p-2 w-28">Total (Rs)</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={item.rowId} className="border-b">
                            <td className="p-2 text-muted-foreground">
                              {i + 1}
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.particular}
                                onChange={(e) =>
                                  updateItem(
                                    item.rowId,
                                    "particular",
                                    e.target.value,
                                  )
                                }
                                placeholder="Item description"
                                className="h-8"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    item.rowId,
                                    "quantity",
                                    Number.parseFloat(e.target.value) || 1,
                                  )
                                }
                                className="h-8"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.quality}
                                onChange={(e) =>
                                  updateItem(
                                    item.rowId,
                                    "quality",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Premium"
                                className="h-8"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) =>
                                  updateItem(
                                    item.rowId,
                                    "rate",
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="h-8"
                              />
                            </td>
                            <td className="p-2 text-right font-semibold text-brand-blue">
                              {(item.quantity * item.rate).toFixed(2)}
                            </td>
                            <td className="p-2">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.rowId)}
                                  className="text-destructive hover:text-destructive/70"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="w-72 space-y-2">
                      <div className="flex justify-between text-sm border-b pb-1">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-semibold">
                          Rs {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold text-sm text-brand-red">
                          Discount %:
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={form.discountPct}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              discountPct:
                                Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="h-8 w-28 text-right"
                        />
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm border-b pb-1">
                          <span className="text-brand-red">
                            Discount ({form.discountPct}%):
                          </span>
                          <span className="text-brand-red font-semibold">
                            - Rs {discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-bold text-brand-blue">
                          Grand Total:
                        </span>
                        <span className="font-bold text-brand-blue text-lg">
                          Rs {grandTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold text-sm">
                          Advance Paid:
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={form.advance}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              advance: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="h-8 w-28 text-right"
                        />
                      </div>
                      <div className="flex justify-between bg-brand-blue text-white px-3 py-2 rounded">
                        <span className="font-bold">Balance Due:</span>
                        <span className="font-bold">
                          Rs {balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-brand-blue">
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.terms}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, terms: e.target.value }))
                    }
                    rows={5}
                  />
                </CardContent>
              </Card>
              <Button
                type="submit"
                className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 text-base"
                data-ocid="admin.invoices.submit_button"
              >
                {editingInvoice ? "Update Invoice" : "Save Invoice & Preview"}
              </Button>
            </form>
          </div>
        )}

        {/* ===== VIEW INVOICE ===== */}
        {view === "view-invoice" && selectedInvoice && (
          <div className="animate-fade-in">
            <InvoiceView
              invoice={selectedInvoice}
              onClose={() => setView("list")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
