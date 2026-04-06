import type { CustomerOrder, Invoice } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { fetchCustomerInvoices, fetchCustomerOrders } from "@/lib/backendData";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  LogOut,
  Package,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [session, setSession] = useState<CustomerSession | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My Account - ID&PC Chak";
    const raw = localStorage.getItem("customerSession");
    if (!raw) {
      navigate({ to: "/customer/login" });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CustomerSession;
      setSession(parsed);
    } catch {
      localStorage.removeItem("customerSession");
      navigate({ to: "/customer/login" });
    }
  }, [navigate]);

  useEffect(() => {
    if (!session || isFetching) return;
    let cancelled = false;
    async function loadData() {
      if (!session) return;
      setLoading(true);
      try {
        // BUG-003 FIX: Wrap BigInt conversion in try/catch to prevent crash
        let customerId: bigint;
        try {
          customerId = BigInt(session.id);
        } catch {
          customerId = BigInt(0);
        }
        const [ordersData, invoicesData] = await Promise.all([
          fetchCustomerOrders(actor, customerId, session.phone),
          fetchCustomerInvoices(actor, session.phone),
        ]);
        if (!cancelled) {
          setOrders(ordersData);
          setInvoices(invoicesData);
        }
      } catch (err) {
        console.error("Dashboard data error", err);
        if (!cancelled) toast.error("Failed to load some data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [session, actor, isFetching]);

  function handleLogout() {
    localStorage.removeItem("customerSession");
    toast.success("Logged out successfully.");
    navigate({ to: "/" });
  }

  if (!session) return null;

  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed",
  );
  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.grandTotal),
    0,
  );

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: <Package className="w-5 h-5" />,
      color: "text-brand-blue",
      bg: "bg-brand-blue/10",
    },
    {
      label: "Completed",
      value: completedOrders.length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: pendingOrders.length,
      icon: <Clock className="w-5 h-5" />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Total Invoiced",
      value: `Rs ${totalInvoiceAmount.toLocaleString()}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-brand-gold",
      bg: "bg-brand-gold/10",
    },
  ];

  return (
    <main className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-blue">
              {session.name}
            </h1>
            <p className="text-muted-foreground text-sm">{session.email}</p>
            <p className="text-muted-foreground text-sm">{session.phone}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 border-brand-red text-brand-red hover:bg-brand-red/10"
          data-ocid="customer_dashboard.logout.button"
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="border-2 border-border shadow-card card-3d"
            data-ocid="customer_dashboard.card"
          >
            <CardContent className="p-4">
              <div
                className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-2 ${s.color}`}
              >
                {s.icon}
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {loading ? <Skeleton className="h-7 w-12" /> : s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-6 bg-muted">
          <TabsTrigger
            value="orders"
            className="flex items-center gap-2"
            data-ocid="customer_dashboard.orders.tab"
          >
            <ClipboardList className="w-4 h-4" /> My Orders
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="flex items-center gap-2"
            data-ocid="customer_dashboard.invoices.tab"
          >
            <FileText className="w-4 h-4" /> My Invoices
          </TabsTrigger>
        </TabsList>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          {loading ? (
            <div
              className="space-y-3"
              data-ocid="customer_dashboard.orders.loading_state"
            >
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div
              className="text-center py-16 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
              data-ocid="customer_dashboard.orders.empty_state"
            >
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No orders yet</p>
              <p className="text-sm mt-1">
                Visit our Services page to place your first order.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => {
                const isCompleted = order.status === "completed";
                return (
                  <Card
                    key={order.id.toString()}
                    className="border-2 border-border shadow-card card-3d"
                    data-ocid={`customer_dashboard.orders.item.${i + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-heading font-bold text-brand-blue text-sm">
                              ORD-
                              {String(Number(order.id) % 10000).padStart(
                                4,
                                "0",
                              )}
                            </span>
                            <Badge
                              className={`text-xs ${
                                isCompleted
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                              variant="outline"
                            >
                              {isCompleted ? "✓ Completed" : "⏳ Pending"}
                            </Badge>
                          </div>
                          <p className="font-semibold text-foreground">
                            {order.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.date} · Qty: {String(order.quantity)}
                          </p>
                          {order.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">
                              {order.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-brand-gold text-sm">
                            Rs {Number(order.totalPrice).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices">
          {loading ? (
            <div
              className="space-y-3"
              data-ocid="customer_dashboard.invoices.loading_state"
            >
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div
              className="text-center py-16 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
              data-ocid="customer_dashboard.invoices.empty_state"
            >
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No invoices found</p>
              <p className="text-sm mt-1">
                Invoices matching your phone number will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv, i) => (
                <Card
                  key={inv.id.toString()}
                  className="border-2 border-border shadow-card card-3d"
                  data-ocid={`customer_dashboard.invoices.item.${i + 1}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-brand-blue text-sm">
                          INV-{inv.id.toString()}
                        </p>
                        <p className="text-sm text-foreground font-semibold">
                          {inv.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-blue">
                          Rs {Number(inv.grandTotal).toLocaleString()}
                        </p>
                        {Number(inv.balance) > 0 && (
                          <p className="text-xs text-brand-red font-semibold">
                            Balance: Rs {Number(inv.balance).toLocaleString()}
                          </p>
                        )}
                        {Number(inv.balance) === 0 && (
                          <Badge
                            className="text-xs bg-green-100 text-green-700"
                            variant="outline"
                          >
                            Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
