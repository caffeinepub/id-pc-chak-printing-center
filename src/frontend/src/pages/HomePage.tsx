import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useApprovedReviews,
  useBannerImage,
  useEmployees,
  useGallery,
  useLogo,
  useServices,
  useVisionMission,
} from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  // BUG-010 FIX: Use useApprovedReviews instead of useReviews for visitor-facing reviews
  const { data: reviews = [] } = useApprovedReviews();
  const { data: bannerImage = "" } = useBannerImage();
  const { data: employees = [] } = useEmployees();
  const { data: logo = "" } = useLogo();
  const { data: gallery = [] } = useGallery();
  const { data: visionMission = { vision: "", mission: "" } } =
    useVisionMission();
  // BUG-011: Load services for the homepage services section
  const { data: services = [] } = useServices();

  useEffect(() => {
    document.title = "ID&PC Chak - Ihsan Designing & Printing Center";
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section
        className={`relative min-h-[85vh] flex items-center depth-hero${
          !bannerImage ? " hero-gradient-bg" : ""
        }`}
        style={{
          backgroundImage: bannerImage ? `url('${bannerImage}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-brand-blue/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Logo */}
            {logo && (
              <div className="mb-6">
                <img
                  src={logo}
                  alt="Ihsan Designing & Printing Center Chak"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in-up">
              Welcome to ID&amp;PC Chak
            </p>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-gold leading-tight mb-6 animate-fade-in-up animate-delay-100 text-shadow-hero hero-gold-underline">
              Premier Designing &amp;
              <br />
              Printing Services
              <br />
              <span className="text-white">in Chak</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
              Professional flex printing, wedding cards, photo studio, visiting
              cards, T-shirt printing, and much more &mdash; at affordable
              prices. Serving Rustam Road Chak, District Shikarpur since 2015.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <Button
                onClick={() => navigate({ to: "/products" })}
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold px-8 h-12 rounded-full text-base btn-3d btn-3d-gold"
                data-ocid="hero.primary_button"
              >
                View Our Services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ to: "/contact" })}
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 h-12 rounded-full text-base btn-3d"
                data-ocid="hero.secondary_button"
              >
                Contact Us
              </Button>
            </div>

            {/* Stats Strip */}
            <div className="flex flex-wrap gap-4 mt-10">
              {employees.length > 0 && (
                <div className="glass flex items-center gap-2 text-white/90 px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-brand-gold" />
                  <span className="font-semibold text-sm">
                    {employees.length} Team Members
                  </span>
                </div>
              )}
              <div className="glass flex items-center gap-2 text-white/90 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                <span className="font-semibold text-sm">Since 2015</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              Our Purpose
            </p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-blue">
              Vision &amp; Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-brand-blue-mid shadow-card card-3d">
              <CardContent className="p-8">
                <h3 className="font-heading font-bold text-xl text-brand-blue mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span> Our Vision
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {visionMission.vision ||
                    "To be the most trusted and professional printing center in Sindh, delivering quality designs and prints that make our customers stand out."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-brand-gold/40 shadow-card card-3d">
              <CardContent className="p-8">
                <h3 className="font-heading font-bold text-xl text-brand-blue mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Our Mission
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {visionMission.mission ||
                    "To provide affordable, high-quality printing and designing services to businesses and individuals, using modern technology and skilled craftsmanship."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* BUG-011 FIX: Dynamic Services Section */}
      {services.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                What We Offer
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-blue">
                Our Services
              </h2>
              <p className="text-muted-foreground mt-2">
                {services.length}+ professional printing and designing services
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((svc, i) => {
                const discountPct =
                  svc.discount && svc.discount > 0 ? svc.discount : 0;
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
                    : null;
                return (
                  <Link
                    key={svc.id}
                    to="/products/$serviceId"
                    params={{ serviceId: svc.id }}
                    className="block group"
                    data-ocid={`home.services.item.${i + 1}`}
                  >
                    <Card className="border-2 border-border shadow-card card-3d hover:border-brand-gold/50 transition-all h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          {svc.image ? (
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{svc.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-bold text-sm text-brand-blue leading-tight">
                              {svc.name}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                svc.inStock !== false
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {svc.inStock !== false ? "In Stock" : "Sold Out"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 flex-wrap">
                            {discountPct > 0 && parsedPrice ? (
                              <>
                                <span className="text-muted-foreground line-through text-xs">
                                  Rs {parsedPrice.toLocaleString()}
                                </span>
                                <span className="font-bold text-brand-gold text-sm">
                                  Rs {finalPrice?.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-brand-gold text-sm font-bold">
                                <Tag className="w-3 h-3" /> {svc.price}
                              </span>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {services.length > 6 && (
              <div className="text-center mt-8">
                <Link to="/products">
                  <Button
                    className="bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold px-8 btn-3d btn-3d-blue"
                    data-ocid="home.services.primary_button"
                  >
                    View All {services.length} Services{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery Section — only shown when images uploaded */}
      {gallery.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                Our Work
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-blue">
                Gallery
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: gallery images are ordered by position
                  key={`gallery-img-${i}`}
                  className="aspect-square rounded-xl overflow-hidden shadow-card border-2 border-border hover:border-brand-gold/50 transition-all card-3d"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portal + Contact Info */}
      <section className="py-20 bg-section-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-2 border-brand-blue-mid shadow-card card-3d">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg text-brand-blue mb-1">
                  Customer Portal
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Check your bill and download invoice
                </p>
                <Button
                  onClick={() => navigate({ to: "/bill-check" })}
                  className="w-full bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold btn-3d btn-3d-gold"
                  data-ocid="home.bill_check.primary_button"
                >
                  Check My Bill
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-brand-red/30 shadow-card bg-brand-red/5 card-3d">
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

      {/* Reviews Section — BUG-010 FIX: only approved reviews */}
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
                  className="border-2 border-border shadow-card animate-fade-in-up card-3d"
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
                      &quot;{r.review}&quot;
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
