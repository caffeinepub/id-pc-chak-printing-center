import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { fetchCustomers, registerCustomerAccount } from "@/lib/backendData";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  LogIn,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AuthTab = "login" | "register";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function saveCustomerSession(session: CustomerSession) {
  localStorage.setItem("customerSession", JSON.stringify(session));
}

function generateOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const [authTab, setAuthTab] = useState<AuthTab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // OTP step state (login step 2)
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [pendingSession, setPendingSession] = useState<CustomerSession | null>(
    null,
  );

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    document.title = "Customer Login - ID&PC Chak";
    // If already logged in, redirect
    const session = localStorage.getItem("customerSession");
    if (session) {
      navigate({ to: "/customer/dashboard" });
    }
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const customers = await fetchCustomers(actor);
      const found = customers.find(
        (c) => c.email.toLowerCase() === loginEmail.toLowerCase().trim(),
      );
      if (!found) {
        setLoginError("No account found with this email address.");
        return;
      }
      if (!found.isActive) {
        setLoginError("This account has been deactivated. Contact admin.");
        return;
      }
      // Simple password check (btoa encoded for FYP demo)
      const storedHash = found.passwordHash;
      const inputHash = btoa(loginPassword);
      const isMatch =
        storedHash === loginPassword ||
        storedHash === inputHash ||
        btoa(storedHash) === btoa(loginPassword);
      if (!isMatch) {
        setLoginError("Incorrect password. Please try again.");
        return;
      }
      // Generate OTP
      const otp = generateOTP();
      setGeneratedOTP(otp);
      setPendingSession({
        id: found.id.toString(),
        name: found.name,
        email: found.email,
        phone: found.phone,
      });
      setShowOTPStep(true);
      setOtpInput("");
      setOtpError("");
    } catch (err) {
      console.error("Login error", err);
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (otpInput.trim() !== generatedOTP) {
      setOtpError("Incorrect OTP. Please try again.");
      return;
    }
    if (!pendingSession) return;
    // Update last login
    if (actor) {
      actor
        .updateCustomerLastLogin(BigInt(pendingSession.id))
        .catch((err) => console.warn("updateLastLogin error", err));
    }
    saveCustomerSession(pendingSession);
    toast.success(`Welcome back, ${pendingSession.name}!`);
    navigate({ to: "/customer/dashboard" });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError("Name, email, and phone are required.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    setRegLoading(true);
    try {
      // Check if email already exists
      const existing = await fetchCustomers(actor);
      const duplicate = existing.find(
        (c) => c.email.toLowerCase() === regEmail.toLowerCase().trim(),
      );
      if (duplicate) {
        setRegError("An account with this email already exists.");
        return;
      }
      const id = BigInt(Date.now());
      const now = BigInt(Date.now());
      await registerCustomerAccount(actor, {
        id,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        passwordHash: btoa(regPassword),
        googleId: "",
        isGoogleUser: false,
        createdAt: now,
        lastLoginAt: 0n,
        isActive: true,
      });
      setRegSuccess(true);
      toast.success("Account created! Please login.");
      setTimeout(() => {
        setRegSuccess(false);
        setAuthTab("login");
        setLoginEmail(regEmail.trim().toLowerCase());
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegPassword("");
        setRegConfirm("");
      }, 1800);
    } catch (err) {
      console.error("Register error", err);
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        background:
          "linear-gradient(135deg, #1a2f6e 0%, #0f1f4d 40%, #1e3a8a 100%)",
      }}
    >
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-7 h-7 text-brand-blue" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Customer Portal
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            ID&PC Chak — Track orders & invoices
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* OTP Step */}
            {showOTPStep ? (
              <div>
                <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-gold" />
                  Verify OTP
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  Enter the OTP to complete login
                </p>

                {/* Demo OTP box */}
                <div
                  className="bg-brand-gold/20 border border-brand-gold rounded-lg p-4 text-center mb-5"
                  data-ocid="customer_login.otp.panel"
                >
                  <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
                    🔐 Demo Mode
                  </p>
                  <p className="text-sm text-foreground/70 mb-2">Your OTP:</p>
                  <p className="font-heading font-bold text-4xl tracking-[0.35em] text-brand-blue">
                    {generatedOTP}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Production: sent via SMS)
                  </p>
                </div>

                {otpError && (
                  <div
                    className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                    data-ocid="customer_login.otp.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-destructive text-sm">{otpError}</p>
                  </div>
                )}

                <form
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                  data-ocid="customer_login.otp.modal"
                >
                  <div>
                    <Label className="text-brand-blue font-semibold">
                      4-Digit OTP Code
                    </Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      placeholder="Enter 4-digit OTP"
                      className="mt-1 text-center text-2xl font-bold tracking-[0.4em] h-14"
                      required
                      autoComplete="one-time-code"
                      data-ocid="customer_login.otp.input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={otpInput.length < 4}
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                    data-ocid="customer_login.otp.submit_button"
                  >
                    Verify & Login
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setShowOTPStep(false);
                    setOtpInput("");
                    setOtpError("");
                  }}
                  className="mt-4 text-sm text-muted-foreground hover:text-brand-blue transition-colors w-full text-center"
                  data-ocid="customer_login.otp.cancel_button"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              <>
                {/* Tab switcher */}
                <div className="flex rounded-xl overflow-hidden border border-border mb-6">
                  <button
                    type="button"
                    onClick={() => setAuthTab("login")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      authTab === "login"
                        ? "bg-brand-blue text-white"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                    data-ocid="customer_login.login.tab"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab("register")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      authTab === "register"
                        ? "bg-brand-blue text-white"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                    data-ocid="customer_login.register.tab"
                  >
                    Register
                  </button>
                </div>

                {/* LOGIN TAB */}
                {authTab === "login" && (
                  <div data-ocid="customer_login.panel">
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
                      <LogIn className="w-5 h-5 text-brand-gold" />
                      Sign In to Your Account
                    </h2>

                    {loginError && (
                      <div
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="customer_login.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-destructive text-sm">{loginError}</p>
                      </div>
                    )}

                    {/* Google login button */}
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Google login requires production deployment. Please use email login for demo.",
                        )
                      }
                      className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 mb-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      data-ocid="customer_login.google.button"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        or sign in with email
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          autoComplete="email"
                          className="mt-1"
                          data-ocid="customer_login.email.input"
                        />
                      </div>
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Password
                        </Label>
                        <Input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Your password"
                          required
                          autoComplete="current-password"
                          className="mt-1"
                          data-ocid="customer_login.password.input"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                        data-ocid="customer_login.submit_button"
                      >
                        {loginLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* REGISTER TAB */}
                {authTab === "register" && (
                  <div data-ocid="customer_register.panel">
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-brand-gold" />
                      Create Your Account
                    </h2>

                    {regSuccess && (
                      <div
                        className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
                        data-ocid="customer_register.success_state"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-700 text-sm font-semibold">
                          Account created! Redirecting to login...
                        </p>
                      </div>
                    )}

                    {regError && (
                      <div
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="customer_register.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-destructive text-sm">{regError}</p>
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Full Name *
                        </Label>
                        <Input
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Muhammad Ali"
                          required
                          className="mt-1"
                          data-ocid="customer_register.name.input"
                        />
                      </div>
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Email Address *
                        </Label>
                        <Input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          autoComplete="email"
                          className="mt-1"
                          data-ocid="customer_register.email.input"
                        />
                      </div>
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Phone Number *
                        </Label>
                        <Input
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="03XX-XXXXXXX"
                          required
                          className="mt-1"
                          data-ocid="customer_register.phone.input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-brand-blue font-semibold">
                            Password *
                          </Label>
                          <Input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min. 6 chars"
                            required
                            autoComplete="new-password"
                            className="mt-1"
                            data-ocid="customer_register.password.input"
                          />
                        </div>
                        <div>
                          <Label className="text-brand-blue font-semibold">
                            Confirm *
                          </Label>
                          <Input
                            type="password"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            placeholder="Repeat"
                            required
                            autoComplete="new-password"
                            className="mt-1"
                            data-ocid="customer_register.confirm_password.input"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={regLoading || regSuccess}
                        className="w-full bg-brand-gold text-brand-blue hover:bg-brand-gold-dark font-semibold h-12 btn-3d btn-3d-gold"
                        data-ocid="customer_register.submit_button"
                      >
                        {regLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/60 hover:text-white text-sm"
            data-ocid="customer_login.back.link"
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
