import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canRequestOTP,
  clearOTP,
  generateOTP,
  getMaskedPhone,
  getOTPAttempts,
  getOTPCooldownSeconds,
  getOTPExpirySeconds,
  logAuditEvent,
  verifyOTP,
} from "@/lib/otp";
import { getAdminPassword } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Step = "credentials" | "otp";

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>("credentials");

  // Credentials step state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [credError, setCredError] = useState("");
  const [credSuccess, setCredSuccess] = useState("");

  // OTP step state
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [currentOTP, setCurrentOTP] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    document.title = "Admin Login - ID&PC Chak";
    if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [navigate]);

  // Countdown timer for OTP step
  useEffect(() => {
    if (step !== "otp") return;

    timerRef.current = setInterval(() => {
      setExpirySeconds(getOTPExpirySeconds());
      setCooldownSeconds(getOTPCooldownSeconds());
      setAttemptsLeft(3 - getOTPAttempts());
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCredError("");
    setCredSuccess("");
    const correctPassword = getAdminPassword();
    if (username === "Kamran911" && password === correctPassword) {
      logAuditEvent("LOGIN_ATTEMPT", "Credentials verified, generating OTP");
      try {
        const code = generateOTP();
        setCurrentOTP(code);
        setOtpInput("");
        setOtpError("");
        setIsLocked(false);
        setExpirySeconds(getOTPExpirySeconds());
        setCooldownSeconds(getOTPCooldownSeconds());
        setAttemptsLeft(3);
        setStep("otp");
        setCredSuccess("OTP Generated successfully.");
      } catch (err) {
        if (err instanceof Error && err.message === "rate_limited") {
          setCredError("Please wait 30 seconds before requesting a new OTP.");
        } else {
          setCredError("Failed to generate OTP. Please try again.");
        }
      }
    } else {
      logAuditEvent(
        "LOGIN_FAILED",
        `Failed login attempt for username: ${username}`,
      );
      setCredError("Invalid username or password. Please try again.");
    }
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    const result = verifyOTP(otpInput);
    if (result.success) {
      logAuditEvent(
        "LOGIN_SUCCESS",
        `Admin logged in successfully at ${new Date().toLocaleString()}`,
      );
      sessionStorage.setItem("isAdminLoggedIn", "true");
      navigate({ to: "/admin/dashboard" });
    } else if (result.error === "expired") {
      setOtpError("OTP has expired. Please request a new one.");
      setIsLocked(true);
    } else if (result.error === "locked") {
      setOtpError(
        "Too many failed attempts. Please wait and request a new OTP.",
      );
      setIsLocked(true);
    } else if (result.error === "no_otp") {
      setOtpError("No OTP found. Please go back and log in again.");
    } else {
      const remaining = 3 - getOTPAttempts();
      setAttemptsLeft(remaining);
      setOtpError(
        `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      );
    }
  }

  function handleResendOTP() {
    if (!canRequestOTP()) return;
    try {
      const code = generateOTP();
      setCurrentOTP(code);
      setOtpInput("");
      setOtpError("");
      setIsLocked(false);
      setAttemptsLeft(3);
      setExpirySeconds(getOTPExpirySeconds());
      setCooldownSeconds(getOTPCooldownSeconds());
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  }

  function handleBackToCredentials() {
    clearOTP();
    setStep("credentials");
    setCredSuccess("");
    setCredError("");
    setOtpInput("");
    setOtpError("");
    setCurrentOTP("");
    setIsLocked(false);
  }

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-brand-blue font-heading font-bold text-xl">
              ID&amp;PC
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-white">
            Admin Panel
          </h1>
          <p className="text-white/60 mt-1">
            Ihsan Designing &amp; Printing Center Chak
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Step indicator */}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              {step === "credentials" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>

            {step === "credentials" ? (
              <>
                <h2 className="font-heading font-bold text-xl text-brand-blue mb-6">
                  Sign In
                </h2>

                {credError && (
                  <div
                    className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                    data-ocid="admin_login.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-destructive text-sm">{credError}</p>
                  </div>
                )}

                {credSuccess && (
                  <div
                    className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg p-3 mb-4"
                    data-ocid="admin_login.success_state"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 text-sm">{credSuccess}</p>
                  </div>
                )}

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                  data-ocid="admin_login.modal"
                >
                  <div>
                    <Label
                      htmlFor="admin-username"
                      className="text-brand-blue font-semibold"
                    >
                      Username
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="pl-10"
                        required
                        autoComplete="username"
                        data-ocid="admin_login.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="admin-password"
                      className="text-brand-blue font-semibold"
                    >
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pl-10"
                        required
                        autoComplete="current-password"
                        data-ocid="admin_login.password.input"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                    data-ocid="admin_login.submit_button"
                  >
                    Continue to OTP Verification
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <Link
                    to="/admin/reset-password"
                    className="text-brand-gold hover:underline text-sm font-medium"
                    data-ocid="admin_login.forgot_password.link"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-heading font-bold text-xl text-brand-blue mb-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-gold" />
                  Enter OTP
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  OTP sent to{" "}
                  <span className="font-semibold text-brand-blue">
                    {getMaskedPhone()}
                  </span>
                </p>

                {/* Demo OTP Display Box */}
                <div
                  className="bg-brand-gold/20 border border-brand-gold rounded-lg p-4 text-center mb-5"
                  data-ocid="admin_login.otp.panel"
                >
                  <p className="text-xs font-semibold text-brand-gold-dark uppercase tracking-wider mb-1">
                    🔐 Demo Mode
                  </p>
                  <p className="text-sm text-foreground/70 mb-2">
                    Your OTP is:
                  </p>
                  <p className="font-heading font-bold text-4xl tracking-[0.35em] text-brand-blue">
                    {currentOTP}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (In production, this would be sent via SMS)
                  </p>
                </div>

                {/* Expiry countdown */}
                <div className="flex justify-between text-xs text-muted-foreground mb-4">
                  <span
                    className={
                      expirySeconds > 0 && expirySeconds <= 30
                        ? "text-destructive font-semibold"
                        : ""
                    }
                    data-ocid="admin_login.otp.loading_state"
                  >
                    ⏱ OTP expires in:{" "}
                    <strong>
                      {expirySeconds > 0 ? `${expirySeconds}s` : "Expired"}
                    </strong>
                  </span>
                  <span>
                    Attempts remaining:{" "}
                    <strong
                      className={attemptsLeft <= 1 ? "text-destructive" : ""}
                    >
                      {attemptsLeft}
                    </strong>
                  </span>
                </div>

                {/* Error message */}
                {otpError && (
                  <div
                    className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                    data-ocid="admin_login.otp.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-destructive text-sm">{otpError}</p>
                  </div>
                )}

                {/* OTP form */}
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="otp-input"
                      className="text-brand-blue font-semibold"
                    >
                      4-Digit OTP Code
                    </Label>
                    <Input
                      id="otp-input"
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
                      disabled={isLocked}
                      autoComplete="one-time-code"
                      data-ocid="admin_login.otp.input"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLocked || otpInput.length < 4}
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue disabled:opacity-50"
                    data-ocid="admin_login.otp.submit_button"
                  >
                    Verify OTP
                  </Button>
                </form>

                {/* Resend OTP */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canRequestOTP() || cooldownSeconds > 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-gold hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    data-ocid="admin_login.otp.resend.button"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : "Resend OTP"}
                  </button>

                  <Link
                    to="/admin/reset-password"
                    className="text-muted-foreground hover:text-brand-blue text-sm"
                    data-ocid="admin_login.forgot_password.link"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-blue mt-5 transition-colors"
                  data-ocid="admin_login.back.button"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to credentials
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/60 hover:text-white text-sm">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
