import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInvalidate, useServices } from "@/hooks/useQueries";
import { backendAddOrder } from "@/lib/backendData";
import { Link, useParams } from "@tanstack/react-router";
import { MessageCircle, Phone, ShoppingCart, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PurchasePage() {
  const { serviceId } = useParams({ from: "/public/products/$serviceId" });
  const { data: services = [] } = useServices();
  const { actor } = useActor();
  const invalidate = useInvalidate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const svc = services.find((s) => s.id === serviceId);

  useEffect(() => {
    document.title = svc ? `${svc.name} - ID&PC Chak` : "Order - ID&PC Chak";
  }, [svc]);

  // Try to parse numeric price value
  const parsedPrice = svc?.price
    ? (() => {
        const match = svc.price.match(/[\d,]+/);
        if (!match) return null;
        return Number.parseInt(match[0].replace(/,/g, ""), 10);
      })()
    : null;

  const total = parsedPrice ? parsedPrice * qty : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    if (!svc) return;
    setSubmitting(true);
    try {
      const orderData = {
        serviceId: svc.id,
        serviceName: svc.name,
        customerName: name,
        phone: phone,
        quantity: qty,
        notes: notes,
        totalPrice: total ?? 0,
        status: "pending",
      };
      await backendAddOrder(actor, orderData);
      invalidate(["orders"]);
      toast.success(`Order placed! We'll contact you shortly on ${phone}.`);
      setName("");
      setPhone("");
      setQty(1);
      setNotes("");
    } catch (err) {
      console.error("Order submit error", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!svc) {
    return (
      <main className="py-20 text-center">
        <p className="text-2xl font-heading font-bold text-brand-blue mb-4">
          Service not found
        </p>
        <Link to="/products">
          <Button variant="outline" data-ocid="purchase.back_button">
            ← Back to Services
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-gold-dark font-semibold text-sm mb-8 transition-colors"
          data-ocid="purchase.back_button"
        >
          ← Back to Services
        </Link>

        {/* Product details card */}
        <Card
          className="border-2 border-border shadow-card card-3d mb-8 animate-fade-in-up"
          data-ocid="purchase.card"
        >
          <CardHeader className="text-center pb-4">
            {svc.image ? (
              <img
                src={svc.image}
                alt={svc.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            ) : (
              <span className="text-6xl block mb-4">{svc.icon}</span>
            )}
            <CardTitle className="font-heading text-3xl font-bold text-brand-blue">
              {svc.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-base leading-relaxed">
              {svc.description}
            </p>
            {svc.price && (
              <span className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-4 py-2 rounded-full text-base font-bold">
                <Tag className="w-4 h-4" /> {svc.price}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Order form */}
        <Card
          className="border-2 border-brand-blue/20 shadow-card card-3d animate-fade-in-up"
          style={{ animationDelay: "0.12s", opacity: 0 }}
          data-ocid="purchase.panel"
        >
          <CardHeader>
            <CardTitle className="font-heading text-xl font-bold text-brand-blue flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-gold" />
              Place Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="cust-name">Customer Name *</Label>
                  <Input
                    id="cust-name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-ocid="purchase.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-phone">Phone Number *</Label>
                  <Input
                    id="cust-phone"
                    placeholder="03XX-XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    data-ocid="purchase.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-32"
                  data-ocid="purchase.input"
                />
              </div>

              {/* Auto-calculated total */}
              {svc.price && (
                <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span className="font-semibold text-brand-blue">
                      {svc.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-semibold text-brand-blue">{qty}</span>
                  </div>
                  <div className="border-t border-brand-gold/30 mt-2 pt-2 flex justify-between">
                    <span className="font-bold text-brand-blue">
                      Estimated Total
                    </span>
                    <span className="font-bold text-brand-gold text-lg">
                      {total !== null
                        ? `Rs ${total.toLocaleString()}`
                        : svc.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    * Final price confirmed upon order processing
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements, size, color, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  data-ocid="purchase.textarea"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-blue font-bold text-base py-3 rounded-xl transition-all"
                data-ocid="purchase.submit_button"
              >
                {submitting ? "Placing Order..." : "✅ Submit Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact section */}
        <div
          className="mt-8 bg-brand-blue rounded-2xl p-6 text-white text-center animate-fade-in-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <p className="font-heading font-bold text-lg mb-1">
            Prefer to contact us directly?
          </p>
          <p className="text-white/70 text-sm mb-4">
            Call or WhatsApp us for instant assistance
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:+923057855334"
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-blue font-semibold px-5 py-2 rounded-full hover:bg-brand-gold-dark transition-colors text-sm"
              data-ocid="purchase.button"
            >
              <Phone className="w-4 h-4" /> +92 305 7855334
            </a>
            <a
              href="https://wa.me/+923057855334"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors text-sm"
              data-ocid="purchase.button"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
