import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

const ALL_SERVICES = [
  {
    icon: "🔢",
    name: "Number Plates",
    description: "Custom vehicle number plates, durable material",
  },
  {
    icon: "✂️",
    name: "Sticker Cutting",
    description: "Any shape/size sticker cutting for branding & decoration",
  },
  {
    icon: "🛡️",
    name: "Coating",
    description: "Glossy or matte protective coating for prints",
  },
  {
    icon: "🪪",
    name: "Duplicate Cards",
    description: "Duplicate ID cards and membership cards",
  },
  {
    icon: "📝",
    name: "Sindhi, Urdu, Arabic & English Composing",
    description: "Multi-language professional typesetting & composing",
  },
  {
    icon: "🧢",
    name: "Cap Printing",
    description: "Custom logo/text printing on caps",
  },
  {
    icon: "👕",
    name: "T-Shirt Printing",
    description: "Custom T-shirt printing with any design or logo",
  },
  {
    icon: "🖼️",
    name: "Photo Print",
    description: "High-quality photo prints, all standard sizes",
  },
  {
    icon: "📷",
    name: "Photo Studio",
    description: "ID photos, portraits, and professional photography",
  },
  {
    icon: "🗂️",
    name: "Photocopy",
    description: "Fast and clear photocopying for all documents",
  },
  {
    icon: "🖨️",
    name: "Panaflex (Flex Printing)",
    description: "Large-format panaflex/flex banners for shops & events",
  },
  {
    icon: "💌",
    name: "Wedding Cards",
    description: "Custom wedding invitation cards, premium paper",
  },
  {
    icon: "🃏",
    name: "Visiting Cards",
    description: "Professional visiting/business cards",
  },
  {
    icon: "📄",
    name: "Pamphlets",
    description: "Pamphlet design and printing for any occasion",
  },
  {
    icon: "📢",
    name: "Advertisements",
    description: "Advertisement design and printing for shops & events",
  },
];

export default function ProductsPage() {
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
            We offer 15+ professional printing and designing services. Visit our
            shop or call for pricing.
          </p>
          <Badge className="mt-3 bg-brand-gold/20 text-brand-blue border-brand-gold/40">
            💡 No online purchasing — visit shop or call us to place orders
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_SERVICES.map((svc, i) => (
            <Card
              key={svc.name}
              className="border-2 border-border hover:border-brand-blue-mid shadow-card transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              <div className="p-6 flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">{svc.icon}</span>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-blue mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {svc.description}
                  </p>
                </div>
              </div>
            </Card>
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
