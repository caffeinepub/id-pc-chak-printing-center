import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Review, getReviews } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

const LOGO =
  "/assets/uploads/screenshot_2026-03-26_231047-019d2b57-e48c-70e8-9b2c-db4c4ce8391c-1.png";

const REAL_SERVICES = [
  {
    icon: "🔢",
    title: "Number Plates",
    description:
      "Custom number plates for vehicles, made with precision and durable material.",
  },
  {
    icon: "✂️",
    title: "Sticker Cutting",
    description:
      "Professional sticker cutting in any shape or size for branding and decoration.",
  },
  {
    icon: "🛡️",
    title: "Coating",
    description:
      "Protective coating services to give your prints a glossy or matte finish.",
  },
  {
    icon: "🪪",
    title: "Duplicate Cards",
    description:
      "High-quality duplicate ID and membership cards made quickly and accurately.",
  },
  {
    icon: "📝",
    title: "Composing",
    description:
      "Sindhi, Urdu, Arabic & English composing services with professional typesetting.",
  },
  {
    icon: "🧢",
    title: "Cap Printing",
    description:
      "Custom cap printing with logos and text for events, teams, and promotions.",
  },
  {
    icon: "👕",
    title: "T-Shirt Printing",
    description:
      "High-quality T-shirt printing with your custom design, text, or logo.",
  },
  {
    icon: "🖼️",
    title: "Photo Print",
    description:
      "Clear and vivid photo prints in all standard sizes with glossy or matte finish.",
  },
  {
    icon: "📷",
    title: "Photo Studio",
    description:
      "Professional photo studio services for ID photos, portraits, and events.",
  },
  {
    icon: "🗂️",
    title: "Photocopy",
    description:
      "Fast and clear photocopying services for documents, forms, and records.",
  },
  {
    icon: "🖨️",
    title: "Panaflex (Flex Printing)",
    description:
      "Large-format flex/panaflex printing for shops, events, and advertisements.",
  },
  {
    icon: "💌",
    title: "Wedding Cards",
    description:
      "Beautiful custom wedding invitation cards with premium designs and paper.",
  },
  {
    icon: "🃏",
    title: "Visiting Cards",
    description:
      "Professional visiting cards with your brand identity at affordable prices.",
  },
  {
    icon: "📄",
    title: "Pamphlets",
    description:
      "Eye-catching pamphlet design and printing for any occasion or promotion.",
  },
  {
    icon: "📢",
    title: "Advertisements",
    description:
      "Creative advertisement design and printing for shops, events, and campaigns.",
  },
];

// Show first 8 on home page
const FEATURED_SERVICES = REAL_SERVICES.slice(0, 8);

export default function HomePage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    document.title = "ID&PC Chak - Ihsan Designing & Printing Center";
    setReviews(getReviews());
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center"
        style={{
          backgroundImage: `url('${LOGO}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-brand-blue/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Logo displayed prominently in hero */}
            <div className="mb-6">
              <img
                src={LOGO}
                alt="Ihsan Designing & Printing Center Chak"
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in-up">
              Welcome to ID&PC Chak
            </p>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-gold leading-tight mb-6 animate-fade-in-up animate-delay-100">
              Premier Designing &<br />
              Printing Services
              <br />
              <span className="text-white">in Chak</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
              Professional flex printing, wedding cards, photo studio, visiting
              cards, T-shirt printing, and much more — at affordable prices.
              Serving Rustam Road Chak, District Shikarpur since 2015.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <Button
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold px-8 h-12 rounded-full text-base"
              >
                View Our Services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ to: "/contact" })}
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 h-12 rounded-full text-base"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              What We Offer
            </p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-blue">
              Our Services
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              We provide 15+ professional printing and designing services — from
              visiting cards to panaflex banners, photo studio to T-shirt
              printing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SERVICES.map((svc, i) => (
              <Card
                key={svc.title}
                className="border-2 border-border hover:border-brand-blue-mid shadow-card hover:shadow-card-hover transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                    {svc.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-blue mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {svc.description}
                  </p>
                  <Link
                    to="/products"
                    className="text-brand-gold font-semibold text-sm hover:underline inline-flex items-center gap-1"
                  >
                    Learn More <ChevronRight className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate({ to: "/products" })}
              className="bg-brand-blue text-white hover:bg-brand-blue-dark"
            >
              View All 15 Services <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Portal + Contact Info */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-2 border-brand-blue-mid shadow-card">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-brand-blue mb-1">
                  Customer Portal
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Check your bill and download invoice
                </p>
                <Button
                  onClick={() => navigate({ to: "/bill-check" })}
                  className="w-full bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold"
                >
                  Check My Bill
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-red/30 shadow-card bg-brand-red/5">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-heading font-bold text-lg text-brand-red mb-2">
                  Contact Info
                </h3>
                <p className="text-sm">
                  <span className="font-semibold text-brand-blue">CEO:</span>{" "}
                  Kamran Ali
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-brand-blue">Phone:</span>{" "}
                  +92 305 7855334
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-brand-blue">Email:</span>{" "}
                  ihsanprintingcnetrechak@gmail.com
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-brand-blue">
                    Address:
                  </span>{" "}
                  Rustam Road Chak Near nako No. 1, District Shikarpur
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews Section — shows only admin-added reviews */}
      {reviews.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                Reviews
              </p>
              <h2 className="font-heading font-bold text-3xl text-brand-blue">
                What Our Customers Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r, i) => (
                <Card
                  key={r.id}
                  className="border-2 border-border shadow-card animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: r.rating }).map((_, si) => (
                        <Star
                          key={`star-${r.id}-${si}`}
                          className="w-4 h-4 fill-brand-gold text-brand-gold"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">
                      "{r.review}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
                        {r.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-blue">
                          {r.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.date}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact strip */}
      <section className="bg-brand-blue py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Phone className="w-6 h-6 text-brand-gold" />
              <p className="text-white font-semibold">Call Us</p>
              <p className="text-white/70 text-sm">+92 305 7855334</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-brand-gold" />
              <p className="text-white font-semibold">Visit Us</p>
              <p className="text-white/70 text-sm">
                Rustam Road Chak, District Shikarpur
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="w-6 h-6 text-brand-gold" />
              <p className="text-white font-semibold">Email Us</p>
              <p className="text-white/70 text-sm">
                ihsanprintingcnetrechak@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
