import { Button } from "@/components/ui/button";
import { useLogo } from "@/hooks/useQueries";
import { useCart } from "@/lib/cartContext";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Bill Check", href: "/bill-check" },
];

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function getCustomerSession(): CustomerSession | null {
  const raw = localStorage.getItem("customerSession");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();
  const { data: logo } = useLogo();
  const { totalItems } = useCart();
  // Derived directly from localStorage on each render (re-reads when pathname changes)
  const customerSession = getCustomerSession();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 navbar-3d no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {logo && (
              <img
                src={logo}
                alt="ID&PC Chak Logo"
                className="h-12 w-auto object-contain rounded shadow-md"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
              />
            )}
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-all duration-200 relative group ${
                  pathname === link.href
                    ? "text-brand-gold"
                    : "text-white/90 hover:text-brand-gold"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-200 ${
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="View cart"
              data-ocid="navbar.cart.button"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-brand-gold text-brand-blue text-[10px] font-bold flex items-center justify-center leading-none px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {customerSession ? (
              <Button
                onClick={() => navigate({ to: "/customer/dashboard" })}
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold text-sm rounded-full px-4 h-9 btn-3d btn-3d-gold flex items-center gap-2"
                data-ocid="navbar.customer_dashboard.button"
              >
                <User className="w-4 h-4" />
                {customerSession.name.split(" ")[0]}
              </Button>
            ) : (
              <Button
                onClick={() => navigate({ to: "/customer/login" })}
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold text-sm rounded-full px-4 h-9 btn-3d btn-3d-gold"
                data-ocid="navbar.customer_login.button"
              >
                My Account
              </Button>
            )}
            <Button
              onClick={() => navigate({ to: "/admin" })}
              className="bg-brand-red text-white hover:opacity-90 text-sm rounded-full px-4 h-9 font-semibold btn-3d"
              data-ocid="navbar.admin_panel.button"
            >
              Admin Panel
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile cart icon */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white"
              aria-label="View cart"
              data-ocid="navbar.cart.button"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] min-h-[16px] rounded-full bg-brand-gold text-brand-blue text-[9px] font-bold flex items-center justify-center leading-none px-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="text-white p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 pb-4 animate-fade-in"
          style={{
            background: "linear-gradient(180deg, #1e4580 0%, #1a3a6b 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-white/90 hover:text-brand-gold font-medium text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            {customerSession ? (
              <Button
                onClick={() => {
                  navigate({ to: "/customer/dashboard" });
                  setMenuOpen(false);
                }}
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold w-full btn-3d btn-3d-gold flex items-center gap-2"
                data-ocid="navbar.customer_dashboard.button"
              >
                <User className="w-4 h-4" />{" "}
                {customerSession.name.split(" ")[0]}&apos;s Account
              </Button>
            ) : (
              <Button
                onClick={() => {
                  navigate({ to: "/customer/login" });
                  setMenuOpen(false);
                }}
                className="bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold w-full btn-3d btn-3d-gold"
                data-ocid="navbar.customer_login.button"
              >
                My Account
              </Button>
            )}
            <Button
              onClick={() => {
                navigate({ to: "/admin" });
                setMenuOpen(false);
              }}
              className="bg-brand-red text-white hover:opacity-90 font-semibold w-full btn-3d"
              data-ocid="navbar.admin_panel.button"
            >
              Admin Panel
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
