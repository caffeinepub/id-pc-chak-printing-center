import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

const REAL_SERVICES = [
  {
    icon: "🔢",
    title: "Number Plates",
    description:
      "Custom number plates for vehicles with durable and high-quality material.",
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
      "Protective coating for prints — glossy or matte finish available.",
  },
  {
    icon: "🪪",
    title: "Duplicate Cards",
    description:
      "High-quality duplicate ID and membership cards made accurately.",
  },
  {
    icon: "📝",
    title: "Sindhi, Urdu, Arabic & English Composing",
    description:
      "Professional multi-language composing and typesetting services.",
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
      "Vivid photo prints in all standard sizes with glossy or matte finish.",
  },
  {
    icon: "📷",
    title: "Photo Studio",
    description:
      "Professional photo studio for ID photos, portraits, and special occasions.",
  },
  {
    icon: "🗂️",
    title: "Photocopy",
    description:
      "Fast and clear photocopying for documents, forms, and records.",
  },
  {
    icon: "🖨️",
    title: "Panaflex (Flex Printing)",
    description:
      "Large-format flex/panaflex printing for shops, events, and outdoor advertising.",
  },
  {
    icon: "💌",
    title: "Wedding Cards",
    description:
      "Beautiful custom wedding invitation cards with premium paper and designs.",
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

const whyUs = [
  "Over 10 years of experience in printing and designing",
  "State-of-the-art printing equipment",
  "Affordable prices without compromising quality",
  "Fast turnaround time — same day service available",
  "Custom designs tailored to your needs",
  "Professional and friendly customer service",
  "Serving entire District Shikarpur area",
  "100% customer satisfaction guarantee",
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us - ID&PC Chak";
  }, []);

  return (
    <main className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Our Story
          </p>
          <h1 className="font-heading font-bold text-4xl text-brand-blue mb-4">
            About ID&PC Chak
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ihsan Designing and Printing Center Chak — your trusted local
            printing and designing partner in Rustam Road Chak, District
            Shikarpur since 2015.
          </p>
        </div>

        {/* History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-fade-in-up">
            <h2 className="font-heading font-bold text-2xl text-brand-blue mb-4">
              Our History & Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ihsan Designing and Printing Center Chak (ID&PC Chak) was
              established in 2015 by Mr. Kamran Ali with a simple mission: to
              provide high-quality printing and designing services to the people
              of Rustam Road Chak and surrounding areas at affordable prices.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Starting with basic printing services, we have grown into a
              full-service design and print shop with modern equipment and a
              team of 5 dedicated professionals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to empower local businesses, families, and
              individuals with professional-quality printing and design
              solutions that help them stand out.
            </p>
          </div>
          <div className="bg-brand-blue rounded-2xl p-8 text-white animate-fade-in-up animate-delay-200">
            <h3 className="font-heading font-bold text-xl mb-4 text-brand-gold">
              At a Glance
            </h3>
            <p className="text-white/80 text-sm mb-1">
              <span className="text-brand-gold font-semibold">CEO:</span> Kamran
              Ali
            </p>
            <p className="text-white/80 text-sm mb-1">
              <span className="text-brand-gold font-semibold">Phone:</span> +92
              305 7855334
            </p>
            <p className="text-white/80 text-sm mb-4">
              <span className="text-brand-gold font-semibold">Email:</span>{" "}
              ihsanprintingcnetrechak@gmail.com
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-gold">2015</p>
                <p className="text-white/70 text-sm mt-1">Established</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-gold">5+</p>
                <p className="text-white/70 text-sm mt-1">Employees</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-gold">500+</p>
                <p className="text-white/70 text-sm mt-1">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-gold">15+</p>
                <p className="text-white/70 text-sm mt-1">Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services — real list */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              What We Do
            </p>
            <h2 className="font-heading font-bold text-3xl text-brand-blue">
              Our Services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REAL_SERVICES.map((svc, i) => (
              <Card
                key={svc.title}
                className="border-2 border-border hover:border-brand-blue-mid shadow-card transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <CardContent className="p-5">
                  <div className="flex gap-3 items-start">
                    <span className="text-3xl flex-shrink-0">{svc.icon}</span>
                    <div>
                      <h3 className="font-heading font-bold text-base text-brand-blue mb-1">
                        {svc.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {svc.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-muted/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              Our Strengths
            </p>
            <h2 className="font-heading font-bold text-3xl text-brand-blue">
              Why Choose ID&PC Chak?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whyUs.map((reason) => (
              <div key={reason} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-sm">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
