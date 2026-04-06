import { Badge } from "@/components/ui/badge";
import { useServices } from "@/hooks/useQueries";
import { useCart } from "@/lib/cartContext";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PackageX, ShoppingCart, Tag } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data: services = [] } = useServices();
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    document.title = "Services - ID&PC Chak";
  }, []);

  return (
    <main className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Our Services
          </p>
          <h1 className="font-heading font-bold text-4xl text-brand-blue mb-4">
            All Services
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We offer {services.length > 0 ? `${services.length}+` : "15+"}{" "}
            professional printing and designing services. Click any service to
            view details and place an order.
          </p>
        </div>

        {/* Floating cart bar */}
        {totalItems > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <Link to="/cart">
              <button
                type="button"
                className="flex items-center gap-3 bg-brand-blue text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:bg-brand-blue/90 transition-all btn-3d btn-3d-blue"
                data-ocid="products.view_cart.button"
              >
                <ShoppingCart className="w-5 h-5" />
                View Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
                <span className="bg-brand-gold text-brand-blue text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => {
            const discountPct =
              svc.discount && svc.discount > 0 ? svc.discount : 0;
            const isInStock = svc.inStock !== false;

            // Parse numeric price for discount calculation
            const parsedPrice = svc.price
              ? (() => {
                  const match = svc.price.match(/[\d,]+/);
                  if (!match) return null;
                  return Number.parseInt(match[0].replace(/,/g, ""), 10);
                })()
              : null;
            const finalPrice =
              parsedPrice && discountPct > 0
                ? Math.round(parsedPrice * (1 - discountPct / 100))
                : parsedPrice;

            return (
              <Link
                key={svc.id}
                to="/products/$serviceId"
                params={{ serviceId: svc.id }}
                className="block group"
                data-ocid={`products.item.${i + 1}`}
              >
                <div
                  className="relative rounded-2xl overflow-hidden border-2 border-border bg-card shadow-card card-3d transition-all animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                >
                  {/* Stock / Discount badges row */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                        isInStock
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isInStock ? (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-0.5" />
                      ) : (
                        <PackageX className="w-3 h-3 mr-0.5" />
                      )}
                      {isInStock ? "In Stock" : "Sold Out"}
                    </span>
                    {discountPct > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-red text-white shadow-sm">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image area */}
                  {svc.image ? (
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={svc.image}
                        alt={svc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 flex items-center justify-center">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {svc.icon}
                      </span>
                    </div>
                  )}

                  {/* Content area */}
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-lg text-brand-blue leading-tight mb-3">
                      {svc.name}
                    </h3>

                    {/* Price block */}
                    <div className="space-y-1 mb-4">
                      {svc.price && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {discountPct > 0 && parsedPrice ? (
                            <>
                              <span className="text-muted-foreground line-through text-sm">
                                Rs {parsedPrice.toLocaleString()}
                              </span>
                              <span className="font-bold text-brand-gold text-lg">
                                Rs {finalPrice?.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-sm font-bold">
                              <Tag className="w-3 h-3" /> {svc.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isInStock
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isInStock ? "Available" : "Unavailable"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    {isInStock && (
                      <button
                        type="button"
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-semibold text-sm py-2 rounded-xl shadow hover:bg-brand-blue/90 active:scale-95 transition-all btn-3d btn-3d-blue"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart({
                            serviceId: svc.id,
                            serviceName: svc.name,
                            price: finalPrice || parsedPrice || 0,
                            imageUrl: svc.image || undefined,
                          });
                          toast.success(`"${svc.name}" added to cart!`);
                        }}
                        data-ocid={`products.cart_button.${i + 1}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {services.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="products.empty_state"
          >
            <p className="text-lg">Loading services...</p>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-16 mb-12 bg-brand-blue rounded-2xl p-8 text-center text-white">
          <h2 className="font-heading font-bold text-2xl mb-2">
            Need a Custom Quote?
          </h2>
          <p className="text-white/70 mb-6">
            For bulk orders or special projects, contact us directly for the
            best price.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+923057855334"
              className="bg-brand-gold text-brand-blue font-semibold px-6 py-2 rounded-full hover:bg-brand-gold-dark transition-colors btn-3d btn-3d-gold"
              data-ocid="products.button"
            >
              📞 Call: +92 305 7855334
            </a>
            <a
              href="mailto:ihsanprintingcnetrechak@gmail.com"
              className="border border-white text-white px-6 py-2 rounded-full hover:bg-white/10 transition-colors btn-3d"
              data-ocid="products.button"
            >
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
