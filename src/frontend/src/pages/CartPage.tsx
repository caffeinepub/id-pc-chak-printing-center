import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { backendAddOrder } from "@/lib/backendData";
import { useCart } from "@/lib/cartContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function getCustomerSession(): CustomerSession | null {
  const raw = localStorage.getItem("customerSession");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQty,
    updateNotes,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);
  const session = getCustomerSession();

  useEffect(() => {
    document.title = "Cart - ID&PC Chak";
  }, []);

  async function handlePlaceOrders() {
    if (!session) {
      toast.error("Please login to place an order.");
      navigate({ to: "/customer/login" });
      return;
    }
    if (items.length === 0) return;

    setIsPlacing(true);
    try {
      let customerId: bigint;
      try {
        customerId = BigInt(session.id);
      } catch {
        customerId = BigInt(0);
      }

      await Promise.all(
        items.map((item) =>
          backendAddOrder(actor, {
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            customerName: session.name,
            phone: session.phone,
            quantity: item.qty,
            notes: item.notes,
            totalPrice: item.price * item.qty,
            status: "pending",
            customerId: customerId.toString(),
          }),
        ),
      );

      clearCart();
      toast.success(
        `${items.length} order${items.length > 1 ? "s" : ""} placed successfully! We'll contact you soon.`,
      );
      navigate({ to: "/customer/dashboard" });
    } catch (err) {
      console.error("Cart order error", err);
      toast.error("Failed to place orders. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <main className="py-12 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl text-brand-blue">
                Your Cart
              </h1>
              <p className="text-muted-foreground text-sm">
                {totalItems} item{totalItems !== 1 ? "s" : ""} ready to order
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          // Empty state
          <div
            className="text-center py-20 border-2 border-dashed border-border rounded-2xl"
            data-ocid="cart.empty_state"
          >
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse our services and add items to get started.
            </p>
            <Link to="/products">
              <Button
                className="bg-brand-blue text-white hover:bg-brand-blue/90 btn-3d btn-3d-blue"
                data-ocid="cart.browse_products.button"
              >
                Browse Services
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4" data-ocid="cart.list">
              {items.map((item, i) => {
                const rowTotal = item.price * item.qty;
                return (
                  <Card
                    key={item.serviceId}
                    className="border-2 border-border shadow-card card-3d animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        {/* Image thumbnail */}
                        {item.imageUrl ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                            <img
                              src={item.imageUrl}
                              alt={item.serviceName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl flex-shrink-0 bg-brand-blue/10 flex items-center justify-center">
                            <Package className="w-8 h-8 text-brand-blue/40" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-heading font-bold text-brand-blue text-base leading-tight">
                              {item.serviceName}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.serviceId)}
                              className="flex-shrink-0 text-muted-foreground hover:text-brand-red transition-colors p-1"
                              aria-label="Remove item"
                              data-ocid={`cart.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-brand-gold font-bold text-sm mt-0.5">
                            Rs {item.price.toLocaleString()} each
                          </p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.serviceId, item.qty - 1)
                                }
                                className="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <Input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) =>
                                  updateQty(
                                    item.serviceId,
                                    Number.parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-14 text-center border-0 border-x border-border rounded-none h-8 px-2 text-sm"
                                data-ocid={`cart.input.${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.serviceId, item.qty + 1)
                                }
                                className="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              = Rs {rowTotal.toLocaleString()}
                            </span>
                          </div>

                          {/* Notes */}
                          <Textarea
                            placeholder="Special instructions (optional)..."
                            value={item.notes}
                            onChange={(e) =>
                              updateNotes(item.serviceId, e.target.value)
                            }
                            className="mt-3 text-sm resize-none h-16"
                            data-ocid={`cart.textarea.${i + 1}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card
                className="border-2 border-brand-blue/30 shadow-card card-3d sticky top-24"
                data-ocid="cart.panel"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-brand-blue font-heading">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.serviceId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate mr-2">
                          {item.serviceName} × {item.qty}
                        </span>
                        <span className="font-semibold flex-shrink-0">
                          Rs {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-gold">
                      Rs {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {!session && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Login required</p>
                      <p>You need to be logged in to place an order.</p>
                    </div>
                  )}

                  <Button
                    onClick={handlePlaceOrders}
                    disabled={isPlacing || items.length === 0}
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue/90 btn-3d btn-3d-blue font-bold text-base h-12"
                    data-ocid="cart.submit_button"
                  >
                    {isPlacing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Orders...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Place All Orders ({totalItems})
                      </>
                    )}
                  </Button>

                  {!session && (
                    <Link to="/customer/login">
                      <Button
                        variant="outline"
                        className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold/10"
                        data-ocid="cart.login.button"
                      >
                        Login to Continue
                      </Button>
                    </Link>
                  )}

                  <Link to="/products">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-brand-blue"
                      data-ocid="cart.continue_shopping.button"
                    >
                      ← Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
