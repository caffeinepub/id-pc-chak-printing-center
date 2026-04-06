import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  useApprovedReviews,
  useInvalidate,
  useServices,
} from "@/hooks/useQueries";
import { backendAddOrder, backendAddReview } from "@/lib/backendData";
import { getReviews, saveReviews } from "@/lib/storage";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  LogIn,
  MessageCircle,
  PackageX,
  Phone,
  ShoppingCart,
  Star,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PurchasePage() {
  const { serviceId } = useParams({ from: "/public/products/$serviceId" });
  const { data: services = [] } = useServices();
  const { data: approvedReviews = [] } = useApprovedReviews();
  const { actor } = useActor();
  const invalidate = useInvalidate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const svc = services.find((s) => s.id === serviceId);

  useEffect(() => {
    document.title = svc ? `${svc.name} - ID&PC Chak` : "Order - ID&PC Chak";
  }, [svc]);

  const discountPct = svc?.discount && svc.discount > 0 ? svc.discount : 0;
  const isInStock = svc?.inStock !== false;

  // Try to parse numeric price value
  const parsedPrice = svc?.price
    ? (() => {
        const match = svc.price.match(/[\d,]+/);
        if (!match) return null;
        return Number.parseInt(match[0].replace(/,/g, ""), 10);
      })()
    : null;

  const unitPrice =
    parsedPrice && discountPct > 0
      ? Math.round(parsedPrice * (1 - discountPct / 100))
      : parsedPrice;
  const total = unitPrice ? unitPrice * qty : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Check if customer is logged in
    const customerSession = localStorage.getItem("customerSession");
    if (!customerSession) {
      setShowLoginPrompt(true);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    if (!svc) return;
    setSubmitting(true);
    try {
      const session = customerSession ? JSON.parse(customerSession) : null;
      const orderData = {
        serviceId: svc.id,
        serviceName: svc.name,
        customerName: name,
        phone: phone,
        quantity: qty,
        notes: notes,
        totalPrice: total ?? 0,
        status: "pending",
        customerId: session?.id ? String(session.id) : undefined,
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

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      toast.error("Please enter your name and review.");
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview = await backendAddReview(actor, {
        customerName: reviewName,
        review: reviewText,
        rating: reviewRating,
        status: "pending",
      });
      // Save to LS as pending
      const reviews = getReviews();
      saveReviews([...reviews, newReview]);
      invalidate(["pendingReviews", "reviews"]);
      setReviewSubmitted(true);
      setReviewName("");
      setReviewText("");
      setReviewRating(5);
      toast.success(
        "Review submitted! It will be visible after admin approval.",
      );
    } catch (err) {
      console.error("Review submit error", err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
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
          className="border-2 border-border shadow-card card-3d mb-8 animate-fade-in-up overflow-hidden"
          data-ocid="purchase.card"
        >
          {svc.image ? (
            <div className="relative">
              <img
                src={svc.image}
                alt={svc.name}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Stock badge over image */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isInStock
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isInStock ? "In Stock" : "Sold Out"}
                </span>
                {discountPct > 0 && (
                  <span className="bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 p-8 text-center">
              <span className="text-7xl block mb-2">{svc.icon}</span>
              <div className="flex justify-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isInStock
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isInStock ? "In Stock" : "Sold Out"}
                </span>
                {discountPct > 0 && (
                  <span className="bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            </div>
          )}
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading text-3xl font-bold text-brand-blue">
              {svc.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-base leading-relaxed">
              {svc.description}
            </p>
            {/* Price block */}
            {svc.price && (
              <div className="flex items-center justify-center gap-3">
                {discountPct > 0 && parsedPrice ? (
                  <>
                    <span className="text-muted-foreground line-through">
                      Rs {parsedPrice.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-4 py-2 rounded-full text-base font-bold">
                      <Tag className="w-4 h-4" /> Rs{" "}
                      {Math.round(
                        parsedPrice * (1 - discountPct / 100),
                      ).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-4 py-2 rounded-full text-base font-bold">
                    <Tag className="w-4 h-4" /> {svc.price}
                  </span>
                )}
              </div>
            )}
            {!isInStock && (
              <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-2">
                <PackageX className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Currently Sold Out — You can still place an inquiry
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order form */}
        <Card
          className="border-2 border-brand-blue/20 shadow-card card-3d animate-fade-in-up mb-8"
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
                      {discountPct > 0 && unitPrice
                        ? `Rs ${unitPrice.toLocaleString()}`
                        : svc.price}
                    </span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-brand-red text-xs">
                        Discount ({discountPct}% OFF)
                      </span>
                      <span className="text-brand-red text-xs font-semibold">
                        Applied
                      </span>
                    </div>
                  )}
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
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-blue font-bold text-base py-3 rounded-xl transition-all btn-3d btn-3d-gold"
                data-ocid="purchase.submit_button"
              >
                {submitting ? "Placing Order..." : "✅ Submit Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            data-ocid="purchase.login_modal.dialog"
          >
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center animate-fade-in-up">
              <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-brand-blue mb-2">
                Login Required
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Please login to your account to place an order.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate({ to: "/customer/login" })}
                  className="bg-brand-blue text-white w-full btn-3d btn-3d-blue"
                  data-ocid="purchase.login_modal.confirm_button"
                >
                  Go to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full"
                  data-ocid="purchase.login_modal.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Contact section */}
        <div
          className="bg-brand-blue rounded-2xl p-6 text-white text-center animate-fade-in-up mb-10"
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
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-blue font-semibold px-5 py-2 rounded-full hover:bg-brand-gold-dark transition-colors text-sm btn-3d btn-3d-gold"
              data-ocid="purchase.button"
            >
              <Phone className="w-4 h-4" /> +92 305 7855334
            </a>
            <a
              href="https://wa.me/+923057855334"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white text-white px-5 py-2 rounded-full hover:bg-white/10 transition-colors text-sm btn-3d"
              data-ocid="purchase.button"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.28s", opacity: 0 }}
        >
          <div className="mb-6">
            <h2 className="font-heading font-bold text-2xl text-brand-blue mb-1">
              Customer Reviews
            </h2>
            <p className="text-muted-foreground text-sm">
              What our customers say about this service
            </p>
          </div>

          {approvedReviews.length === 0 ? (
            <div
              className="text-center py-10 border-2 border-dashed border-border rounded-2xl text-muted-foreground mb-8"
              data-ocid="purchase.empty_state"
            >
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid gap-4 mb-8">
              {approvedReviews.map((r, i) => (
                <Card
                  key={r.id}
                  className="border-2 border-border shadow-card card-3d"
                  data-ocid={`purchase.item.${i + 1}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-brand-blue">
                          {r.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.date}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={`rs-${r.id}-${si}`}
                            className={`w-4 h-4 ${
                              si < r.rating
                                ? "fill-brand-gold text-brand-gold"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
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

          {/* Write a Review form */}
          <Card
            className="border-2 border-brand-blue/20 shadow-card"
            data-ocid="purchase.panel"
          >
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold text-brand-blue flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-gold" />
                Write a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewSubmitted ? (
                <div
                  className="text-center py-6 bg-green-50 rounded-xl border border-green-200"
                  data-ocid="purchase.success_state"
                >
                  <div className="text-green-600 font-bold text-lg mb-1">
                    ✅ Thank you for your review!
                  </div>
                  <p className="text-green-700 text-sm">
                    Your review is under review and will be published after
                    admin approval.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setReviewSubmitted(false)}
                    data-ocid="purchase.button"
                  >
                    Write Another Review
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="review-name">Your Name *</Label>
                    <Input
                      id="review-name"
                      placeholder="e.g. Muhammad Ali"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                      data-ocid="purchase.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Rating *</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              n <= reviewRating
                                ? "fill-brand-gold text-brand-gold"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-text">Your Review *</Label>
                    <Textarea
                      id="review-text"
                      placeholder="Share your experience with this service..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      required
                      data-ocid="purchase.textarea"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-brand-blue text-white hover:bg-brand-blue-dark w-full btn-3d btn-3d-blue"
                    data-ocid="purchase.submit_button"
                  >
                    {submittingReview ? "Submitting..." : "💬 Submit Review"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Reviews are visible after admin approval.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
