import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useServices } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Tag } from "lucide-react";
import { useEffect } from "react";

export default function ProductsPage() {
  const { data: services = [] } = useServices();

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
            We offer {services.length}+ professional printing and designing
            services. Click any service to view details and place an order.
          </p>
          <Badge className="mt-3 bg-brand-gold/20 text-brand-blue border-brand-gold/40">
            💡 Click a service below to view details & order
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <Link
              key={svc.id}
              to="/products/$serviceId"
              params={{ serviceId: svc.id }}
              className="block group"
              data-ocid={`products.item.${i + 1}`}
            >
              <Card
                className="border-2 border-border hover:border-brand-blue-mid shadow-card transition-all animate-fade-in-up card-3d h-full cursor-pointer group-hover:shadow-lg overflow-hidden"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                {/* Product image if available */}
                {svc.image ? (
                  <div className="relative">
                    <img
                      src={svc.image}
                      alt={svc.name}
                      className="w-full h-32 object-cover"
                    />
                    <span className="absolute top-2 right-2 text-2xl">
                      {svc.icon}
                    </span>
                  </div>
                ) : null}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 flex-1">
                    {!svc.image && (
                      <span className="text-4xl flex-shrink-0">{svc.icon}</span>
                    )}
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg text-brand-blue mb-1">
                        {svc.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {svc.description}
                      </p>
                      {svc.price && (
                        <span className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-1 rounded-full text-xs font-bold">
                          <Tag className="w-3 h-3" /> {svc.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                      View & Order <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 bg-brand-blue rounded-2xl p-8 text-center text-white">
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
              className="bg-brand-gold text-brand-blue font-semibold px-6 py-2 rounded-full hover:bg-brand-gold-dark transition-colors"
            >
              📞 Call: +92 305 7855334
            </a>
            <a
              href="mailto:ihsanprintingcnetrechak@gmail.com"
              className="border border-white text-white px-6 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
