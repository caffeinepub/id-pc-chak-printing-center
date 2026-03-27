import InvoiceView from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Invoice,
  type InvoiceItem,
  type Review,
  addInvoice,
  addReview,
  deleteInvoice,
  deleteReview,
  getInvoices,
  getNextInvoiceNumber,
  getReviews,
  updateInvoice,
} from "@/lib/storage";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  FileText,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  PlusCircle,
  Printer,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_TERMS = `1. Payment is due within 7 days of invoice date.
2. No refund or cancellation after printing starts.
3. Customer is responsible for proofreading content.
4. ID&PC Chak is not liable for errors approved by customer.
5. Advance payment is non-refundable.`;

// Auto-generate 3 empty rows when creating a new invoice
const DEFAULT_ITEMS = () => [
  { rowId: "row-1", particular: "", quantity: 1, quality: "", rate: 0 },
  { rowId: "row-2", particular: "", quantity: 1, quality: "", rate: 0 },
  { rowId: "row-3", particular: "", quantity: 1, quality: "", rate: 0 },
];

type Tab = "invoices" | "reviews";
type View = "list" | "create" | "view-invoice";

interface ItemRow extends Omit<InvoiceItem, "srNo" | "total"> {
  rowId: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("invoices");
  const [view, setView] = useState<View>("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Invoice form state
  const [form, setForm] = useState({
    customerName: "",
    userId: "",
    phone: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    terms: DEFAULT_TERMS,
    advance: 0,
  });
  const [items, setItems] = useState<ItemRow[]>(DEFAULT_ITEMS());

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    review: "",
    rating: 5,
  });

  useEffect(() => {
    document.title = "Admin Dashboard - ID&PC Chak";
    if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate({ to: "/admin", replace: true });
      return;
    }
    setInvoices(getInvoices());
    setReviews(getReviews());
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("isAdminLoggedIn");
    navigate({ to: "/admin" });
  }

  // Computed invoice items with totals
  const computedItems: InvoiceItem[] = items.map((item, i) => ({
    srNo: i + 1,
    particular: item.particular,
    quantity: item.quantity,
    quality: item.quality,
    rate: item.rate,
    total: item.quantity * item.rate,
  }));

  const grandTotal = computedItems.reduce((sum, item) => sum + item.total, 0);
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

  function generateUserId() {
    const list = getInvoices();
    return `CUST-${String(list.length + 1).padStart(3, "0")}`;
  }

  function handleSaveInvoice(e: React.FormEvent) {
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
        terms: form.terms,
      };
      updateInvoice(updated);
      setInvoices(getInvoices());
      setSelectedInvoice(updated);
      setEditingInvoice(null);
      setView("view-invoice");
    } else {
      const invoice: Invoice = {
        id: getNextInvoiceNumber(),
        userId: form.userId || generateUserId(),
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        date: form.date,
        items: computedItems,
        grandTotal,
        advance: form.advance,
        balance,
        terms: form.terms,
      };
      addInvoice(invoice);
      setInvoices(getInvoices());
      setSelectedInvoice(invoice);
      setView("view-invoice");
    }
  }

  function resetForm() {
    setForm({
      customerName: "",
      userId: "",
      phone: "",
      address: "",
      date: new Date().toISOString().split("T")[0],
      terms: DEFAULT_TERMS,
      advance: 0,
    });
    setItems(DEFAULT_ITEMS());
    setEditingInvoice(null);
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

  function handleDeleteInvoice(inv: Invoice) {
    if (
      window.confirm(
        `Delete invoice ${inv.id} for ${inv.customerName}? This cannot be undone.`,
      )
    ) {
      deleteInvoice(inv.id);
      setInvoices(getInvoices());
    }
  }

  function handlePrintInvoice(inv: Invoice) {
    setSelectedInvoice(inv);
    setView("view-invoice");
    setTimeout(() => window.print(), 400);
  }

  function handleSendInvoice(inv: Invoice) {
    alert(
      `Invoice ${inv.id} for ${inv.customerName}\nUser ID: ${inv.userId}\n\nShare the User ID and Invoice Number with the customer so they can view it on the Bill Check page.`,
    );
  }

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.review.trim()) return;
    addReview(reviewForm);
    setReviews(getReviews());
    setReviewForm({ customerName: "", review: "", rating: 5 });
  }

  function handleDeleteReview(id: string) {
    if (window.confirm("Delete this review?")) {
      deleteReview(id);
      setReviews(getReviews());
    }
  }

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
        <Button
          onClick={logout}
          variant="outline"
          className="border-white/40 text-white hover:bg-white/10 text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {view === "list" && (
          <div className="flex gap-2 mb-6 no-print">
            <button
              type="button"
              onClick={() => setTab("invoices")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                tab === "invoices"
                  ? "bg-brand-blue text-white"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              <FileText className="w-4 h-4" /> Invoices
            </button>
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                tab === "reviews"
                  ? "bg-brand-blue text-white"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Reviews
            </button>
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
                  resetForm();
                  setView("create");
                }}
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Create New Invoice
              </Button>
            </div>

            {invoices.length === 0 ? (
              <Card className="border-dashed border-2">
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
                                data-ocid={`admin.view_invoice.button.${i + 1}`}
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
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintInvoice(inv)}
                                className="border-gray-400 text-gray-600 hover:bg-gray-100 h-8 px-2"
                                title="Print"
                              >
                                <Printer className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendInvoice(inv)}
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

        {/* ===== REVIEWS TAB ===== */}
        {view === "list" && tab === "reviews" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-brand-blue">
                Customer Reviews
              </h1>
              <p className="text-muted-foreground text-sm">
                Add reviews from real customers. They will appear on the Home
                page.
              </p>
            </div>

            {/* Add Review Form */}
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
                              className={`w-6 h-6 transition-colors ${
                                n <= reviewForm.rating
                                  ? "fill-brand-gold text-brand-gold"
                                  : "text-gray-300"
                              }`}
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

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No reviews added yet. Add your first customer review above!
                  </p>
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
                          title="Delete review"
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

        {/* ===== CREATE / EDIT INVOICE FORM ===== */}
        {view === "create" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
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
              {/* Customer details */}
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

              {/* Items table */}
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
                              {/* Free text quality field — admin can type anything */}
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

                  {/* Totals */}
                  <div className="flex justify-end mt-4">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Grand Total:</span>
                        <span className="font-bold text-brand-blue">
                          Rs {grandTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold">Advance:</Label>
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
                          className="h-8 w-32 text-right"
                        />
                      </div>
                      <div className="flex justify-between bg-brand-blue text-white px-3 py-2 rounded">
                        <span className="font-bold">Balance:</span>
                        <span className="font-bold">
                          Rs {balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
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
