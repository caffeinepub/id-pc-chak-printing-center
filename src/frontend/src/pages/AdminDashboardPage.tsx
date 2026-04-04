import type { CustomerAccount } from "@/backend";
import InvoiceView from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  useApprovedReviews,
  useBillingItems,
  useContactMessages,
  useInvalidate,
  useInvoices,
  useOrders,
  usePendingReviews,
} from "@/hooks/useQueries";
import {
  backendAddBillingItem,
  backendAddEmployee,
  backendAddInvoice,
  backendAddReview,
  backendAddService,
  backendDeleteBillingItem,
  backendDeleteContactMessage,
  backendDeleteEmployee,
  backendDeleteInvoice,
  backendDeleteOrder,
  backendDeleteReview,
  backendDeleteService,
  backendMarkMessageRead,
  backendUpdateBillingItem,
  backendUpdateEmployee,
  backendUpdateInvoice,
  backendUpdateOrder,
  backendUpdateReview,
  backendUpdateService,
  fetchCustomers,
  saveAboutStats,
  saveBannerImage,
  saveLogo,
} from "@/lib/backendData";
import {
  type BillingItem,
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
  BarChart3,
  Bell,
  CheckCircle,
  Eye,
  FileText,
  Image,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  PlusCircle,
  Printer,
  Send,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_TERMS = `1. Payment is due within 7 days of invoice date.
2. No refund or cancellation after printing starts.
3. Customer is responsible for proofreading content.
4. ID&PC Chak is not liable for errors approved by customer.
5. Advance payment is non-refundable.`;

const DEFAULT_ITEMS = () => [
  {
    rowId: "row-1",
    particular: "",
    quantity: 1,
    quality: "",
    rate: 0,
    billingItemId: 0,
  },
  {
    rowId: "row-2",
    particular: "",
    quantity: 1,
    quality: "",
    rate: 0,
    billingItemId: 0,
  },
  {
    rowId: "row-3",
    particular: "",
    quantity: 1,
    quality: "",
    rate: 0,
    billingItemId: 0,
  },
];

type Tab =
  | "invoices"
  | "orders"
  | "messages"
  | "reviews"
  | "employees"
  | "services"
  | "items"
  | "reports"
  | "banner"
  | "logo"
  | "about"
  | "customers";
type View = "list" | "create" | "view-invoice";

interface ItemRow extends Omit<InvoiceItem, "srNo" | "total"> {
  rowId: string;
  billingItemId: number;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ORDER_STATUSES = ["pending", "confirmed", "completed"];
const REPORT_PERIODS = ["daily", "weekly", "monthly"] as const;
type ReportPeriod = (typeof REPORT_PERIODS)[number];

function formatOrderNumber(id: string): string {
  const num = Number.parseInt(id, 10) || 0;
  return `ORD-${String(num % 10000).padStart(4, "0")}`;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const invalidate = useInvalidate();
  const [tab, setTab] = useState<Tab>("invoices");
  const [view, setView] = useState<View>("list");
  const { data: invoices = [] } = useInvoices();
  const { data: orders = [] } = useOrders();
  const { data: contactMessages = [] } = useContactMessages();
  const { data: billingItems = [] } = useBillingItems();
  const { data: pendingReviews = [] } = usePendingReviews();
  const { data: approvedReviews = [] } = useApprovedReviews();
  const [_reviews, setReviews] = useState<Review[]>([]);
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
  const [itemSearches, setItemSearches] = useState<Record<string, string>>({});
  const [itemDropdownOpen, setItemDropdownOpen] = useState<
    Record<string, boolean>
  >({});

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
    inStock: true,
    discount: 0,
  };
  const [svcForm, setSvcForm] = useState(emptySvc);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const svcImageRef = useRef<HTMLInputElement>(null);

  // Billing Item form
  const emptyBillingItem = {
    name: "",
    sellingPrice: 0,
    purchasePrice: 0,
    category: "",
  };
  const [billingItemForm, setBillingItemForm] = useState(emptyBillingItem);
  const [editingBillingItem, setEditingBillingItem] =
    useState<BillingItem | null>(null);

  // Banner / Logo
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [aboutYears, setAboutYears] = useState<string>("");
  const [aboutClients, setAboutClients] = useState<string>("");

  // Reports
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("monthly");
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerAccount | null>(null);

  const unreadCount = contactMessages.filter((m) => !m.isRead).length;
  const pendingReviewCount = pendingReviews.length;

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
    setAboutYears(localStorage.getItem("idpc_years_experience") || "10+");
    setAboutClients(localStorage.getItem("idpc_num_clients") || "1000+");
  }, [navigate]);

  // Load customers when customers tab becomes active
  useEffect(() => {
    if (tab !== "customers") return;
    setCustomersLoading(true);
    fetchCustomers(actor)
      .then((data) => setCustomers(data))
      .catch((err) => console.error("fetchCustomers error", err))
      .finally(() => setCustomersLoading(false));
  }, [tab, actor]);
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
    billingItemId: item.billingItemId || 0,
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
        billingItemId: 0,
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
  function selectBillingItem(rowId: string, bi: BillingItem) {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId
          ? {
              ...item,
              particular: bi.name,
              rate: bi.sellingPrice,
              billingItemId: Number(bi.id),
            }
          : item,
      ),
    );
    setItemSearches((prev) => ({ ...prev, [rowId]: bi.name }));
    setItemDropdownOpen((prev) => ({ ...prev, [rowId]: false }));
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
    setItemSearches({});
    setItemDropdownOpen({});
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
        billingItemId: item.billingItemId || 0,
      })),
    );
    setView("create");
  }

  function handleCreateInvoiceFromOrder(order: (typeof orders)[0]) {
    resetInvoiceForm();
    setForm((prev) => ({
      ...prev,
      customerName: order.customerName,
      phone: order.phone,
      date: new Date().toISOString().split("T")[0],
    }));
    setItems([
      {
        rowId: "row-order-1",
        particular: order.serviceName,
        quantity: order.quantity,
        quality: "",
        rate:
          order.totalPrice > 0
            ? Math.round(order.totalPrice / order.quantity)
            : 0,
        billingItemId: 0,
      },
    ]);
    setTab("invoices");
    setView("create");
  }

  async function handleDeleteInvoice(inv: Invoice) {
    if (window.confirm(`Delete invoice ${inv.id} for ${inv.customerName}?`)) {
      await backendDeleteInvoice(actor, inv.id);
      invalidate(["invoices"]);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.review.trim()) return;
    const newReview = await backendAddReview(actor, {
      ...reviewForm,
      status: "approved",
    });
    setReviews((prev) => {
      const updated = [...prev, newReview];
      saveReviews(updated);
      return updated;
    });
    setReviewForm({ customerName: "", review: "", rating: 5 });
    invalidate(["reviews", "approvedReviews"]);
  }

  async function handleApproveReview(r: Review) {
    await backendUpdateReview(actor, { ...r, status: "approved" });
    invalidate(["reviews", "approvedReviews", "pendingReviews"]);
  }

  async function handleRejectReview(r: Review) {
    await backendUpdateReview(actor, { ...r, status: "rejected" });
    invalidate(["reviews", "approvedReviews", "pendingReviews"]);
  }

  async function handleDeleteReview(id: string) {
    if (window.confirm("Delete this review?")) {
      await backendDeleteReview(actor, id);
      setReviews((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        saveReviews(updated);
        return updated;
      });
      invalidate(["reviews", "approvedReviews", "pendingReviews"]);
    }
  }

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
    if (window.confirm("Delete this employee?")) {
      await backendDeleteEmployee(actor, id);
      setEmployees((prev) => {
        const list = prev.filter((em) => em.id !== id);
        saveEmployees(list);
        return list;
      });
      invalidate(["employees"]);
    }
  }

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
      inStock: svc.inStock !== false,
      discount: svc.discount || 0,
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

  async function handleSaveBillingItem(e: React.FormEvent) {
    e.preventDefault();
    if (editingBillingItem) {
      const updated = { ...billingItemForm, id: editingBillingItem.id };
      await backendUpdateBillingItem(actor, updated);
    } else {
      await backendAddBillingItem(actor, billingItemForm);
    }
    setBillingItemForm(emptyBillingItem);
    setEditingBillingItem(null);
    invalidate(["billingItems"]);
  }

  function handleEditBillingItem(item: BillingItem) {
    setEditingBillingItem(item);
    setBillingItemForm({
      name: item.name,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.purchasePrice,
      category: item.category,
    });
  }

  async function handleDeleteBillingItem(id: string) {
    if (window.confirm("Delete this billing item?")) {
      await backendDeleteBillingItem(actor, id);
      invalidate(["billingItems"]);
    }
  }

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
    alert("Logo updated successfully!");
  }

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

  function getReportInvoices() {
    const now = new Date();
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      if (reportPeriod === "daily") {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (reportPeriod === "weekly") {
        const diffMs = now.getTime() - d.getTime();
        return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
      }
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
  }

  function calcReportData() {
    const filtered = getReportInvoices();
    const totalSales = filtered.reduce((s, inv) => s + inv.grandTotal, 0);
    let totalCost = 0;
    for (const inv of filtered) {
      for (const item of inv.items) {
        if (item.billingItemId && item.billingItemId > 0) {
          const bi = billingItems.find(
            (b) => b.id === String(item.billingItemId),
          );
          if (bi) totalCost += bi.purchasePrice * item.quantity;
        }
      }
    }
    return {
      filtered,
      totalSales,
      totalCost,
      totalProfit: totalSales - totalCost,
    };
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
      badge: pendingReviewCount || undefined,
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
      key: "items",
      label: "Billing Items",
      icon: <Package className="w-4 h-4" />,
    },
    {
      key: "reports",
      label: "Reports",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "banner",
      label: "Banner Image",
      icon: <Image className="w-4 h-4" />,
    },
    { key: "logo", label: "Logo", icon: <Image className="w-4 h-4" /> },
    { key: "about", label: "About Stats", icon: <Info className="w-4 h-4" /> },
    {
      key: "customers",
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      badge: customers.length || undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
        {view === "list" && (
          <div className="flex flex-wrap gap-2 mb-6 no-print">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${tab === t.key ? "bg-brand-blue text-white" : "bg-muted text-foreground hover:bg-muted/70"}`}
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
                  <p className="text-muted-foreground">No invoices yet.</p>
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
                                    `Invoice ${inv.id} for ${inv.customerName}\nUser ID: ${inv.userId}`,
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
                {orders.length} orders •{" "}
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
                    No customer orders yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-blue text-white">
                        <th className="text-left p-3">Order #</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Phone</th>
                        <th className="text-left p-3">Service</th>
                        <th className="text-center p-3">Qty</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <tr
                          key={order.id}
                          className="border-b border-border hover:bg-muted/40 transition-colors"
                          data-ocid={`admin.orders.row.${i + 1}`}
                        >
                          <td className="p-3 font-bold text-brand-blue">
                            {formatOrderNumber(order.id)}
                          </td>
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
                              className={`border rounded px-2 py-1 text-xs font-semibold cursor-pointer ${order.status === "pending" ? "border-yellow-400 text-yellow-700 bg-yellow-50" : order.status === "confirmed" ? "border-blue-400 text-blue-700 bg-blue-50" : "border-green-400 text-green-700 bg-green-50"}`}
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
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCreateInvoiceFromOrder(order)
                                }
                                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white h-7 px-2 text-xs"
                                title="Create Invoice"
                                data-ocid={`admin.orders.edit_button.${i + 1}`}
                              >
                                <FileText className="w-3 h-3 mr-1" /> Invoice
                              </Button>
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
                    No contact messages yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contactMessages.map((msg, i) => (
                  <Card
                    key={msg.id}
                    className={`border-2 shadow-card transition-colors ${!msg.isRead ? "border-brand-gold/60 bg-brand-gold/5" : "border-border"}`}
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
                Manage and approve customer reviews.
              </p>
            </div>

            {pendingReviews.length > 0 && (
              <div className="mb-8">
                <h2 className="font-heading font-bold text-lg text-brand-gold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Pending Approval (
                  {pendingReviews.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingReviews.map((r, i) => (
                    <Card
                      key={r.id}
                      className="border-2 border-brand-gold/50 shadow-card bg-brand-gold/5"
                      data-ocid={`admin.reviews.item.${i + 1}`}
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
                          <div className="flex gap-1">
                            {Array.from({ length: r.rating }).map((_, si) => (
                              <Star
                                key={`prs-${r.id}-${si}`}
                                className="w-4 h-4 fill-brand-gold text-brand-gold"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm italic mb-3">
                          "{r.review}"
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveReview(r)}
                            className="bg-green-600 text-white hover:bg-green-700 h-8 px-3 text-xs flex-1"
                            data-ocid={`admin.reviews.confirm_button.${i + 1}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectReview(r)}
                            className="border-red-400 text-red-600 hover:bg-red-50 h-8 px-3 text-xs flex-1"
                            data-ocid={`admin.reviews.cancel_button.${i + 1}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReview(r.id)}
                            className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card className="border-2 border-border shadow-card mb-8">
              <CardHeader>
                <CardTitle className="text-brand-blue">
                  Add Review (Admin)
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
                        data-ocid="admin.reviews.input"
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
                      data-ocid="admin.reviews.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                    data-ocid="admin.reviews.submit_button"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Review (Approved)
                  </Button>
                </form>
              </CardContent>
            </Card>

            <h2 className="font-heading font-bold text-lg text-brand-blue mb-4">
              Approved Reviews ({approvedReviews.length})
            </h2>
            {approvedReviews.length === 0 ? (
              <Card
                className="border-dashed border-2"
                data-ocid="admin.reviews.empty_state"
              >
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No approved reviews yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedReviews.map((r, i) => (
                  <Card
                    key={r.id}
                    className="border-2 border-border shadow-card"
                    data-ocid={`admin.reviews.row.${i + 1}`}
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
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, si) => (
                              <Star
                                key={`rs-${r.id}-${si}`}
                                className="w-4 h-4 fill-brand-gold text-brand-gold"
                              />
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReview(r.id)}
                            className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-8 px-2"
                            data-ocid={`admin.reviews.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
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
                Products page
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
                        placeholder="e.g. 🖨️"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Discount %
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={svcForm.discount}
                        onChange={(e) =>
                          setSvcForm((p) => ({
                            ...p,
                            discount: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Label className="text-brand-blue font-semibold">
                        In Stock
                      </Label>
                      <button
                        type="button"
                        onClick={() =>
                          setSvcForm((p) => ({ ...p, inStock: !p.inStock }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${svcForm.inStock ? "bg-green-500" : "bg-gray-300"}`}
                        data-ocid="admin.services.toggle"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${svcForm.inStock ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                      <span className="text-sm text-muted-foreground">
                        {svcForm.inStock ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Product Image
                      </Label>
                      <Input
                        ref={svcImageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSvcImage}
                        className="mt-1"
                      />
                      {svcForm.image && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={svcForm.image}
                            alt="preview"
                            className="w-16 h-16 rounded object-cover border border-border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSvcForm((p) => ({ ...p, image: "" }))
                            }
                            className="text-xs text-brand-red hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
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
                        placeholder="Short description..."
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-2xl">{svc.icon}</span>
                          <p className="font-bold text-brand-blue">
                            {svc.name}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${svc.inStock !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {svc.inStock !== false ? "In Stock" : "Sold Out"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {svc.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="inline-block bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded text-xs font-bold">
                            {svc.price}
                          </span>
                          {(svc.discount || 0) > 0 && (
                            <span className="inline-block bg-red-100 text-brand-red border border-brand-red/20 px-2 py-0.5 rounded text-xs font-bold">
                              {svc.discount}% OFF
                            </span>
                          )}
                        </div>
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

        {/* ===== BILLING ITEMS TAB ===== */}
        {view === "list" && tab === "items" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Billing Items
              </h1>
              <p className="text-muted-foreground text-sm">
                {billingItems.length} items • Purchase price is hidden from
                invoices
              </p>
            </div>
            <Card className="border-2 border-border shadow-card mb-8">
              <CardHeader>
                <CardTitle className="text-brand-blue">
                  {editingBillingItem ? "Edit Item" : "Add New Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBillingItem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Item Name *
                      </Label>
                      <Input
                        value={billingItemForm.name}
                        onChange={(e) =>
                          setBillingItemForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Visiting Cards (100 pcs)"
                        required
                        className="mt-1"
                        data-ocid="admin.items.input"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Category
                      </Label>
                      <Input
                        value={billingItemForm.category}
                        onChange={(e) =>
                          setBillingItemForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        placeholder="e.g. Printing, Designing"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold">
                        Selling Price (Rs) *
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={billingItemForm.sellingPrice}
                        onChange={(e) =>
                          setBillingItemForm((p) => ({
                            ...p,
                            sellingPrice:
                              Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-blue font-semibold flex items-center gap-2">
                        Purchase Price (Rs) *{" "}
                        <span className="text-xs bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">
                          Admin Only
                        </span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={billingItemForm.purchasePrice}
                        onChange={(e) =>
                          setBillingItemForm((p) => ({
                            ...p,
                            purchasePrice:
                              Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Not shown on customer invoices. Used for profit reports.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                      data-ocid="admin.items.submit_button"
                    >
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {editingBillingItem ? "Update Item" : "Add Item"}
                    </Button>
                    {editingBillingItem && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingBillingItem(null);
                          setBillingItemForm(emptyBillingItem);
                        }}
                        data-ocid="admin.items.cancel_button"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
            {billingItems.length === 0 ? (
              <Card
                className="border-dashed border-2"
                data-ocid="admin.items.empty_state"
              >
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No billing items yet. Add items to use them in invoices.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-blue text-white">
                        <th className="text-left p-3">Item Name</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-right p-3">Selling Price</th>
                        <th className="text-right p-3">
                          Purchase Price (Admin)
                        </th>
                        <th className="text-right p-3">Profit Margin</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingItems.map((item, i) => (
                        <tr
                          key={item.id}
                          className="border-b border-border hover:bg-muted/40"
                          data-ocid={`admin.items.row.${i + 1}`}
                        >
                          <td className="p-3 font-semibold">{item.name}</td>
                          <td className="p-3 text-muted-foreground">
                            {item.category || "—"}
                          </td>
                          <td className="p-3 text-right font-bold text-brand-gold">
                            Rs {item.sellingPrice.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-brand-red font-semibold">
                            Rs {item.purchasePrice.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-green-600 font-semibold">
                            Rs{" "}
                            {(
                              item.sellingPrice - item.purchasePrice
                            ).toLocaleString()}
                            {item.sellingPrice > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                (
                                {Math.round(
                                  ((item.sellingPrice - item.purchasePrice) /
                                    item.sellingPrice) *
                                    100,
                                )}
                                %)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBillingItem(item)}
                                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white h-7 px-2"
                                data-ocid={`admin.items.edit_button.${i + 1}`}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBillingItem(item.id)}
                                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white h-7 px-2"
                                data-ocid={`admin.items.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3 h-3" />
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

        {/* ===== REPORTS TAB ===== */}
        {view === "list" && tab === "reports" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Sales Reports
              </h1>
              <p className="text-muted-foreground text-sm">
                View sales, profit, and performance data
              </p>
            </div>
            <div className="flex gap-3 mb-6">
              {REPORT_PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReportPeriod(p)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm capitalize transition-colors ${reportPeriod === p ? "bg-brand-blue text-white" : "bg-muted text-foreground hover:bg-muted/70"}`}
                  data-ocid="admin.reports.tab"
                >
                  {p}
                </button>
              ))}
            </div>
            {(() => {
              const { filtered, totalSales, totalCost, totalProfit } =
                calcReportData();
              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="border-2 border-brand-blue/30 shadow-card">
                      <CardContent className="p-5 text-center">
                        <TrendingUp className="w-8 h-8 text-brand-blue mx-auto mb-2" />
                        <p className="text-3xl font-heading font-bold text-brand-blue">
                          {filtered.length}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Invoices
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-brand-gold/30 shadow-card">
                      <CardContent className="p-5 text-center">
                        <FileText className="w-8 h-8 text-brand-gold mx-auto mb-2" />
                        <p className="text-2xl font-heading font-bold text-brand-gold">
                          Rs {totalSales.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Total Sales
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-brand-red/30 shadow-card">
                      <CardContent className="p-5 text-center">
                        <Package className="w-8 h-8 text-brand-red mx-auto mb-2" />
                        <p className="text-2xl font-heading font-bold text-brand-red">
                          Rs {totalCost.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Total Cost
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-300 shadow-card">
                      <CardContent className="p-5 text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p
                          className={`text-2xl font-heading font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          Rs {totalProfit.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {totalProfit >= 0 ? "Profit" : "Loss"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {filtered.length === 0 ? (
                    <Card
                      className="border-dashed border-2"
                      data-ocid="admin.reports.empty_state"
                    >
                      <CardContent className="p-12 text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          No invoices found for the selected period.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-border shadow-card">
                      <CardHeader>
                        <CardTitle className="text-brand-blue text-base">
                          Invoice Details —{" "}
                          {reportPeriod.charAt(0).toUpperCase() +
                            reportPeriod.slice(1)}{" "}
                          Report
                        </CardTitle>
                      </CardHeader>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted border-b">
                              <th className="text-left p-3">Invoice #</th>
                              <th className="text-left p-3">Customer</th>
                              <th className="text-left p-3">Phone</th>
                              <th className="text-left p-3">Date</th>
                              <th className="text-right p-3">Total (Rs)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((inv, i) => (
                              <tr
                                key={inv.id}
                                className="border-b border-border hover:bg-muted/30"
                                data-ocid={`admin.reports.row.${i + 1}`}
                              >
                                <td className="p-3 font-semibold text-brand-blue">
                                  {inv.id}
                                </td>
                                <td className="p-3">{inv.customerName}</td>
                                <td className="p-3 text-muted-foreground">
                                  {inv.phone || "—"}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {inv.date}
                                </td>
                                <td className="p-3 text-right font-bold text-brand-gold">
                                  {inv.grandTotal.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-brand-blue/10 font-bold">
                              <td
                                colSpan={4}
                                className="p-3 text-right text-brand-blue"
                              >
                                Total:
                              </td>
                              <td className="p-3 text-right text-brand-gold">
                                {totalSales.toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </Card>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ===== BANNER TAB ===== */}
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

        {/* ===== LOGO TAB ===== */}
        {view === "list" && tab === "logo" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Logo Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload a new logo. Updates everywhere on the website and
                invoices.
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
                    Recommended: PNG with transparent background.
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

        {/* ===== ABOUT STATS TAB ===== */}
        {view === "list" && tab === "about" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                About Page Stats
              </h1>
              <p className="text-muted-foreground text-sm">
                Update Experience and Clients figures. Changes are reflected
                instantly.
              </p>
            </div>
            <Card className="border-2 border-border shadow-card max-w-2xl">
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-brand-blue font-semibold">
                    Years of Experience
                  </Label>
                  <Input
                    value={aboutYears}
                    onChange={(e) => setAboutYears(e.target.value)}
                    placeholder="e.g. 10+"
                    className="mt-1"
                    data-ocid="admin.about.input"
                  />
                </div>
                <div>
                  <Label className="text-brand-blue font-semibold">
                    Number of Happy Customers
                  </Label>
                  <Input
                    value={aboutClients}
                    onChange={(e) => setAboutClients(e.target.value)}
                    placeholder="e.g. 1000+"
                    className="mt-1"
                    data-ocid="admin.about.input"
                  />
                </div>
                <Button
                  onClick={async () => {
                    await saveAboutStats(actor, aboutYears, aboutClients);
                    invalidate(["aboutStats"]);
                    alert("About page stats updated!");
                  }}
                  className="bg-brand-blue text-white hover:bg-brand-blue-dark w-full"
                  data-ocid="admin.about.save_button"
                >
                  <Info className="w-4 h-4 mr-2" /> Save About Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CUSTOMERS TAB ===== */}
        {view === "list" && tab === "customers" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-blue">
                  Customers
                </h1>
                <p className="text-muted-foreground text-sm">
                  Registered customer accounts and activity
                </p>
              </div>
              <div className="bg-brand-blue/10 text-brand-blue font-heading font-bold text-2xl rounded-2xl px-5 py-3 border border-brand-blue/20">
                {customers.length}{" "}
                <span className="text-sm font-normal">total</span>
              </div>
            </div>
            {customersLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.customers.loading_state"
              >
                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div
                className="text-center py-16 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
                data-ocid="admin.customers.empty_state"
              >
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No customers yet</p>
                <p className="text-sm">
                  Customer accounts will appear here once registered.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((c, i) => (
                  <Card
                    key={c.id.toString()}
                    className="border-2 border-border shadow-card card-3d"
                    data-ocid={`admin.customers.item.${i + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-heading font-bold text-brand-blue">
                              {c.name}
                            </p>
                            {c.isGoogleUser && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Google
                              </span>
                            )}
                            {!c.isActive && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {c.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {c.phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined:{" "}
                            {new Date(Number(c.createdAt)).toLocaleDateString()}
                          </p>
                          {Number(c.lastLoginAt) > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Last login:{" "}
                              {new Date(
                                Number(c.lastLoginAt),
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(c)}
                          className="flex-shrink-0"
                          data-ocid={`admin.customers.edit_button.${i + 1}`}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* Customer detail modal */}
            {selectedCustomer && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                data-ocid="admin.customers.modal"
              >
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-bold text-xl text-brand-blue">
                      Customer Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-muted-foreground hover:text-foreground"
                      data-ocid="admin.customers.close_button"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-semibold">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-semibold">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-semibold">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered</span>
                      <span className="font-semibold">
                        {new Date(
                          Number(selectedCustomer.createdAt),
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-semibold">
                        {Number(selectedCustomer.lastLoginAt) > 0
                          ? new Date(
                              Number(selectedCustomer.lastLoginAt),
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={`font-semibold ${selectedCustomer.isActive ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedCustomer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Login Type</span>
                      <span className="font-semibold">
                        {selectedCustomer.isGoogleUser ? "Google" : "Email"}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-brand-blue text-white"
                    onClick={() => setSelectedCustomer(null)}
                    data-ocid="admin.customers.dialog.close_button"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
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
                  {billingItems.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-3 bg-brand-gold/10 px-3 py-2 rounded-lg">
                      💡 Type in the "Particular" field to search and select
                      billing items automatically
                    </p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted border-b">
                          <th className="text-left p-2 w-10">Sr#</th>
                          <th className="text-left p-2">Particular</th>
                          <th className="text-left p-2 w-20">Qty</th>
                          <th className="text-left p-2 w-36">Quality</th>
                          <th className="text-left p-2 w-24">Rate (Rs)</th>
                          <th className="text-right p-2 w-28">Total (Rs)</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => {
                          const search =
                            itemSearches[item.rowId] ?? item.particular;
                          const showDropdown =
                            itemDropdownOpen[item.rowId] &&
                            billingItems.length > 0 &&
                            search.length > 0;
                          const filteredBItems = billingItems.filter((bi) =>
                            bi.name
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                          );
                          return (
                            <tr key={item.rowId} className="border-b">
                              <td className="p-2 text-muted-foreground">
                                {i + 1}
                              </td>
                              <td className="p-2 relative">
                                <Input
                                  value={search}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setItemSearches((prev) => ({
                                      ...prev,
                                      [item.rowId]: val,
                                    }));
                                    updateItem(item.rowId, "particular", val);
                                    setItemDropdownOpen((prev) => ({
                                      ...prev,
                                      [item.rowId]: true,
                                    }));
                                    if (!val)
                                      updateItem(
                                        item.rowId,
                                        "billingItemId",
                                        0,
                                      );
                                  }}
                                  onFocus={() =>
                                    setItemDropdownOpen((prev) => ({
                                      ...prev,
                                      [item.rowId]: true,
                                    }))
                                  }
                                  onBlur={() =>
                                    setTimeout(
                                      () =>
                                        setItemDropdownOpen((prev) => ({
                                          ...prev,
                                          [item.rowId]: false,
                                        })),
                                      200,
                                    )
                                  }
                                  placeholder="Item description or search..."
                                  className="h-8"
                                />
                                {showDropdown && filteredBItems.length > 0 && (
                                  <div className="absolute z-30 left-0 top-full mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {filteredBItems.map((bi) => (
                                      <button
                                        key={bi.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-brand-gold/10 flex items-center justify-between"
                                        onMouseDown={() =>
                                          selectBillingItem(item.rowId, bi)
                                        }
                                      >
                                        <span className="font-semibold">
                                          {bi.name}
                                        </span>
                                        <span className="text-brand-gold font-bold">
                                          Rs {bi.sellingPrice.toLocaleString()}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
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
                          );
                        })}
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
