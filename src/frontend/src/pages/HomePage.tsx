import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useBannerImage,
  useEmployees,
  useLogo,
  useReviews,
  useServices,
} from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
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
  const { data: reviews = [] } = useReviews();
  const { data: services = [] } = useServices();
  const { data: bannerImage = "" } = useBannerImage();
  const { data: employees = [] } = useEmployees();
  const { data: logo = "" } = useLogo();

  useEffect(() => {
    document.title = "ID&PC Chak - Ihsan Designing & Printing Center";
  }, []);

  const featuredServices = services.slice(0, 8);

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center depth-hero"
        style={{
          backgroundImage: bannerImage ? `url('${bannerImage}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-brand-blue/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Logo — loaded from backend so it updates when admin changes it */}
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
              Welcome to ID&PC Chak
            </p>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-gold leading-tight mb-6 animate-fade-in-up animate-delay-100 text-shadow-hero">
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
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold px-8 h-12 rounded-full text-base btn-3d btn-3d-gold"
              >
                View Our Services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ to: "/contact" })}
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 h-12 rounded-full text-base btn-3d"
              >
                Contact Us
              </Button>
            </div>

            {/* Stats Strip */}
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-2 text-white/80">
                <Tag className="w-5 h-5 text-brand-gold" />
                <span className="font-semibold">
                  {services.length}+ Services
                </span>
              </div>
              {employees.length > 0 && (
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5 text-brand-gold" />
                  <span className="font-semibold">
                    {employees.length} Team Members
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/80">
                <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                <span className="font-semibold">Since 2015</span>
              </div>
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
              We provide {services.length}+ professional printing and designing
              services — from visiting cards to panaflex banners, photo studio
              to T-shirt printing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((svc, i) => (
              <Card
                key={svc.id}
                className="border-2 border-border hover:border-brand-blue-mid shadow-card hover:shadow-card-hover transition-all duration-300 group animate-fade-in-up card-3d card-3d-gold"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                    {svc.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-blue mb-2">
                    {svc.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 flex-1">
                    {svc.description}
                  </p>
                  {/* Price Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-1 rounded-full text-xs font-bold">
                      <Tag className="w-3 h-3" /> {svc.price}
                    </span>
                  </div>
                  <Link
                    to="/products"
                    className="text-brand-blue font-semibold text-sm hover:underline inline-flex items-center gap-1"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          {services.length > 8 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => navigate({ to: "/products" })}
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                View All {services.length} Services{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Portal + Contact Info */}
      <section className="py-20 bg-muted/50">
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

      {/* Reviews Section */}
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
