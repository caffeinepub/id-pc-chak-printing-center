import { useLogo } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/+923057855334";
const FACEBOOK_URL = "https://web.facebook.com/profile.php?id=100092254816678";
const INSTAGRAM_URL =
  "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Fihsanprintingcenter%253Figshid%253DZDdkNTZiNTM%253D%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExWm0yRVBUTlZlME9MU1RQZHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6nWFLNTvAid0CfHzrppOiQK0qsGZUOXG-eO29yZV6oED_VrdcPtSxKH55b-A_aem_7A8O0FcA96dt8J9cJD112w&h=AT77ft9vZQ6fr4KdMkvAO1x5aXwlx7g-1AlHJXiLdlhLPxmPqSDBntVrYLD5CKi1CA-sxvIfWoTeLYfXn04MRfFPNev3WvKb8RBQCaKi46sQR0HPNUEIHGBPTvRJijbQGe4N";

export default function Footer() {
  const year = new Date().getFullYear();
  const { data: logo } = useLogo();

  return (
    <footer className="bg-brand-blue text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logo ? (
                <img
                  src={logo}
                  alt="ID&PC Chak Logo"
                  className="h-14 w-auto object-contain rounded"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center">
                  <span className="text-brand-blue font-heading font-bold text-sm">
                    ID&PC
                  </span>
                </div>
              )}
              <div>
                <p className="font-heading font-bold text-lg leading-tight">
                  Ihsan Designing &
                </p>
                <p className="text-brand-gold font-heading font-semibold text-sm">
                  Printing Center Chak
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-2">
              Your trusted partner for all printing and designing needs. Quality
              work, on-time delivery, and satisfaction guaranteed.
            </p>
            <p className="text-white/60 text-sm">
              <span className="text-brand-gold font-semibold">CEO:</span> Kamran
              Ali
            </p>
            {/* Social Media - WhatsApp, Facebook, Instagram only */}
            <div className="flex gap-3 mt-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                title="Chat on WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  role="img"
                  aria-label="WhatsApp"
                >
                  <title>WhatsApp</title>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-brand-gold mb-4 uppercase tracking-wider text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" as const },
                { label: "About Us", href: "/about" as const },
                { label: "Services", href: "/products" as const },
                { label: "Contact", href: "/contact" as const },
                { label: "Bill Check", href: "/bill-check" as const },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-brand-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-brand-gold mb-4 uppercase tracking-wider text-sm">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">+92 305 7855334</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">
                  Rustam Road Chak Near nako Number 1 Chak District Shikarpur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">
                  ihsanprintingcnetrechak@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/50 text-sm">
            © {year} Ihsan Designing & Printing Center Chak. All rights
            reserved.
          </p>
          <p className="text-white/60 text-sm font-semibold">
            Developed by GFXKamran
          </p>
        </div>
      </div>
    </footer>
  );
}
