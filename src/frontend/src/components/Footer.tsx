import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center">
                <span className="text-brand-blue font-heading font-bold text-sm">
                  ID&PC
                </span>
              </div>
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
            <div className="flex gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-colors"
              >
                <Twitter className="w-4 h-4" />
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
