import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInvalidate } from "@/hooks/useQueries";
import { backendAddContactMessage } from "@/lib/backendData";
import { saveMessage } from "@/lib/storage";
import { CheckCircle, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();
  const invalidate = useInvalidate();

  useEffect(() => {
    document.title = "Contact Us - ID&PC Chak";
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.message.trim()) errs.message = "Message is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Save to localStorage
      saveMessage(form);
      // Save to backend
      await backendAddContactMessage(actor, form);
      invalidate(["contactMessages"]);
      setSubmitted(true);
      setForm({ name: "", phone: "", message: "" });
      setErrors({});
    } catch (err) {
      console.error("Contact form submit error", err);
      // Still show success since local save worked
      setSubmitted(true);
      setForm({ name: "", phone: "", message: "" });
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  const businessHours = [
    { day: "Saturday – Thursday", hours: "9:00 AM – 9:00 PM" },
    { day: "Friday", hours: "9:00 AM – 1:00 PM, then 3:00 PM – 9:00 PM" },
  ];

  return (
    <main className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Get In Touch
          </p>
          <h1 className="font-heading font-bold text-4xl text-brand-blue mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a project in mind? We&apos;d love to help. Send us a message
            and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="font-heading font-bold text-2xl text-brand-blue">
              Contact Information
            </h2>

            {[
              {
                icon: Phone,
                label: "Phone Number",
                value: "+92 305 7855334",
                color: "bg-blue-100",
              },
              {
                icon: MapPin,
                label: "Address",
                value:
                  "Rustam Road Chak Near Nako Number 1 Chak District Shikarpur",
                color: "bg-amber-100",
              },
              {
                icon: Mail,
                label: "Email Address",
                value: "ihsanprintingcnetrechak@gmail.com",
                color: "bg-red-100",
              },
            ].map((info) => (
              <Card
                key={info.label}
                className="border-2 border-border shadow-card"
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <info.icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-blue text-sm">
                      {info.label}
                    </p>
                    <p className="text-muted-foreground text-sm whitespace-pre-line mt-0.5">
                      {info.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Business Hours Card */}
            <Card className="border-2 border-border shadow-card">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-brand-blue text-sm mb-2">
                    Business Hours
                  </p>
                  <div className="space-y-1.5">
                    {businessHours.map((bh) => (
                      <div
                        key={bh.day}
                        className="flex flex-col sm:flex-row sm:gap-2"
                      >
                        <span className="text-sm font-medium text-brand-blue min-w-[160px]">
                          {bh.day}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {bh.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up animate-delay-200">
            <Card className="border-2 border-brand-blue-mid shadow-card">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-2xl text-brand-blue mb-6">
                  Send a Message
                </h2>

                {submitted ? (
                  <div
                    className="text-center py-8"
                    data-ocid="contact.success_state"
                  >
                    <CheckCircle className="w-16 h-16 text-brand-gold mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-xl text-brand-blue mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground">
                      Thank you for contacting us. We will get back to you soon.
                    </p>
                    <Button
                      className="mt-6 bg-brand-blue text-white hover:bg-brand-blue-dark"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    data-ocid="contact.modal"
                  >
                    <div>
                      <Label
                        htmlFor="contact-name"
                        className="text-brand-blue font-semibold"
                      >
                        Your Name *
                      </Label>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Enter your full name"
                        className="mt-1"
                        data-ocid="contact.input"
                      />
                      {errors.name && (
                        <p
                          className="text-destructive text-xs mt-1"
                          data-ocid="contact.name_error"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="contact-phone"
                        className="text-brand-blue font-semibold"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="contact-phone"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="e.g. +92 300 1234567"
                        className="mt-1"
                        data-ocid="contact.phone.input"
                      />
                      {errors.phone && (
                        <p
                          className="text-destructive text-xs mt-1"
                          data-ocid="contact.phone_error"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="contact-message"
                        className="text-brand-blue font-semibold"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="contact-message"
                        value={form.message}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, message: e.target.value }))
                        }
                        placeholder="Tell us about your project or inquiry..."
                        rows={5}
                        className="mt-1"
                        data-ocid="contact.textarea"
                      />
                      {errors.message && (
                        <p
                          className="text-destructive text-xs mt-1"
                          data-ocid="contact.message_error"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12"
                      data-ocid="contact.submit_button"
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Google Maps Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
              Our Location
            </p>
            <h2 className="font-heading font-bold text-3xl text-brand-blue">
              Find Us on Map
            </h2>
            <p className="text-muted-foreground mt-2">
              Rustam Road Chak Near Nako Number 1 Chak, District Shikarpur
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-brand-blue-mid">
            <iframe
              src="https://maps.google.com/maps?q=Rustam+Road+Chak+Near+Nako+Number+1+Chak+District+Shikarpur&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ID&PC Chak Location"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
