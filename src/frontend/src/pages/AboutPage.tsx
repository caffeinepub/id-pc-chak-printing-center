import { Card, CardContent } from "@/components/ui/card";
import {
  useAboutStats,
  useApprovedReviews,
  useEmployees,
  useServices,
} from "@/hooks/useQueries";
import { CheckCircle2, Star, Users } from "lucide-react";
import { useEffect } from "react";

export default function AboutPage() {
  const { data: employees = [] } = useEmployees();
  const { data: services = [] } = useServices();
  const { data: aboutStats = { yearsExperience: "10+", numClients: "1000+" } } =
    useAboutStats();
  const { data: approvedReviews = [] } = useApprovedReviews();

  useEffect(() => {
    document.title = "About Us - ID&PC Chak";
  }, []);

  return (
    <main className="py-12">
      {/* Hero */}
      <section className="bg-brand-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Our Story
          </p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4">
            About ID&amp;PC Chak
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Ihsan Designing &amp; Printing Center has been serving the community
            of Rustam Road Chak, District Shikarpur since 2015. We are dedicated
            to quality, speed, and affordability.
          </p>
        </div>
      </section>

      {/* Business Stats */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="bg-background rounded-2xl p-6 shadow-card border-2 border-brand-blue-mid card-3d">
              <p className="font-heading font-bold text-4xl text-brand-blue">
                {services.length}+
              </p>
              <p className="text-muted-foreground text-sm mt-1">Services</p>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-card border-2 border-brand-gold/40 card-3d">
              <p className="font-heading font-bold text-4xl text-brand-gold">
                {aboutStats.yearsExperience}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Years Experience
              </p>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-card border-2 border-brand-red/30 card-3d">
              <p className="font-heading font-bold text-4xl text-brand-red">
                {aboutStats.numClients}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Happy Customers
              </p>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-card border-2 border-brand-blue-mid card-3d">
              <p className="font-heading font-bold text-4xl text-brand-blue">
                {employees.length}
              </p>
              <p className="text-muted-foreground text-sm mt-1">Team Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                Who We Are
              </p>
              <h2 className="font-heading font-bold text-3xl text-brand-blue mb-4">
                Our Story
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ID&amp;PC Chak was founded by Kamran Ali with the vision to
                bring professional printing and designing services to the heart
                of Chak, District Shikarpur. Starting with a single printer and
                a passion for design, we have grown into a full-service printing
                center offering 15+ services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From number plates and visiting cards to wedding invitations and
                large-format flex banners, we handle every printing need with
                precision and care. Our commitment to quality and customer
                satisfaction has made us the trusted printing center of the
                region.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Professional quality printing on every order",
                "Fast turnaround times without compromising quality",
                "Affordable pricing for all budgets",
                "Expert design assistance available",
                "Multi-language composing: Sindhi, Urdu, Arabic & English",
                "Serving the community since 2015",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              What We Do
            </p>
            <h2 className="font-heading font-bold text-3xl text-brand-blue">
              Our Services
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-background rounded-xl p-4 text-center shadow-card border border-border hover:border-brand-blue-mid transition-colors card-3d"
              >
                <div className="text-3xl mb-2">{svc.icon}</div>
                <p className="font-semibold text-brand-blue text-sm">
                  {svc.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      {employees.length > 0 && (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                The People Behind ID&amp;PC
              </p>
              <h2 className="font-heading font-bold text-3xl text-brand-blue">
                Meet Our Team
              </h2>
              <p className="text-muted-foreground mt-2">
                <span className="inline-flex items-center gap-1 font-semibold text-brand-blue">
                  <Users className="w-4 h-4" /> {employees.length} dedicated
                  team member{employees.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {employees.map((emp) => (
                <Card
                  key={emp.id}
                  className="border-2 border-border hover:border-brand-blue-mid shadow-card hover:shadow-card-hover transition-all duration-300 text-center group card-3d"
                >
                  <CardContent className="p-6">
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        alt={emp.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-brand-gold mx-auto mb-4 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4 border-4 border-brand-gold group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-3xl">
                          {emp.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <p className="font-heading font-bold text-brand-blue text-lg leading-tight">
                      {emp.fullName}
                    </p>
                    <p className="text-brand-gold font-semibold text-sm mt-1">
                      {emp.designation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      {approvedReviews.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
                What Customers Say
              </p>
              <h2 className="font-heading font-bold text-3xl text-brand-blue">
                Customer Reviews
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedReviews.map((r, i) => (
                <Card
                  key={r.id}
                  className="border-2 border-border shadow-card card-3d"
                  data-ocid={`about.reviews.item.${i + 1}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
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
                    <p className="text-muted-foreground text-sm italic leading-relaxed">
                      "{r.review}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Owner Info */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Leadership
          </p>
          <h2 className="font-heading font-bold text-3xl mb-4">
            CEO &amp; Founder
          </h2>
          <div className="inline-flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-brand-gold/20 border-4 border-brand-gold flex items-center justify-center mb-4">
              <span className="text-brand-gold font-bold text-3xl">K</span>
            </div>
            <p className="font-heading font-bold text-2xl text-brand-gold">
              Kamran Ali
            </p>
            <p className="text-white/70 mt-1">
              Founder &amp; CEO, ID&amp;PC Chak
            </p>
            <p className="text-white/60 text-sm mt-2">+92 305 7855334</p>
          </div>
        </div>
      </section>
    </main>
  );
}
