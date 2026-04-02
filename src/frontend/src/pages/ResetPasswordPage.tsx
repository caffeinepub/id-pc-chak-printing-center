import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canRequestOTP,
  generateOTP,
  getMaskedPhone,
  getOTPAttempts,
  getOTPCooldownSeconds,
  getOTPExpirySeconds,
  logAuditEvent,
  verifyOTP,
} from "@/lib/otp";
import { setAdminPassword } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Lock,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ResetStep = 1 | 2 | 3;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>(1);

  // Step 1 state
  const [step1Error, setStep1Error] = useState("");

  // Step 2 state
  const [currentOTP, setCurrentOTP] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.title = "Reset Password - ID&PC Chak";
  }, []);

  // Countdown timer for OTP step
  useEffect(() => {
    if (step !== 2) return;

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

  function handleRequestOTP() {
    setStep1Error("");
    try {
      const code = generateOTP();
      setCurrentOTP(code);
      setOtpInput("");
      setOtpError("");
      setIsLocked(false);
      setAttemptsLeft(3);
      setExpirySeconds(getOTPExpirySeconds());
      setCooldownSeconds(getOTPCooldownSeconds());
      setStep(2);
    } catch (err) {
      if (err instanceof Error && err.message === "rate_limited") {
        const remaining = getOTPCooldownSeconds();
        setStep1Error(
          `Please wait ${remaining} seconds before requesting a new OTP.`,
        );
      } else {
        setStep1Error("Failed to generate OTP. Please try again.");
      }
    }
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    const result = verifyOTP(otpInput);
    if (result.success) {
      logAuditEvent(
        "PASSWORD_RESET_OTP_SUCCESS",
        `OTP verified for password reset at ${new Date().toLocaleString()}`,
      );
      setStep(3);
    } else if (result.error === "expired") {
      setOtpError("OTP has expired. Please request a new one.");
      setIsLocked(true);
    } else if (result.error === "locked") {
      setOtpError(
        "Too many failed attempts. Please wait and request a new OTP.",
      );
      setIsLocked(true);
    } else if (result.error === "no_otp") {
      setOtpError("No OTP found. Please go back and request a new OTP.");
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

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setAdminPassword(newPassword);
    logAuditEvent(
      "PASSWORD_RESET_SUCCESS",
      `Admin password reset successfully at ${new Date().toLocaleString()}`,
    );
    setSuccess(true);
    setTimeout(() => navigate({ to: "/admin" }), 3000);
  }

  const stepLabels: Record<ResetStep, string> = {
    1: "Step 1 of 3",
    2: "Step 2 of 3",
    3: "Step 3 of 3",
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-brand-blue" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Reset Password
          </h1>
          <p className="text-white/60 mt-1">
            Verify via OTP to reset your password
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {success ? (
              <div
                className="text-center py-4"
                data-ocid="reset_password.success_state"
              >
                <CheckCircle className="w-14 h-14 text-brand-gold mx-auto mb-3" />
                <h2 className="font-heading font-bold text-xl text-brand-blue mb-2">
                  Password Reset!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Your password has been changed successfully. Redirecting to
                  login...
                </p>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {stepLabels[step]}
                </p>

                {/* STEP 1: Request OTP */}
                {step === 1 && (
                  <div>
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-brand-gold" />
                      Reset via OTP
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      An OTP will be sent to your registered phone number.
                    </p>

                    <div className="bg-muted rounded-lg p-4 text-center mb-6">
                      <p className="text-xs text-muted-foreground mb-1">
                        Registered Phone
                      </p>
                      <p className="font-heading font-bold text-lg text-brand-blue tracking-wider">
                        {getMaskedPhone()}
                      </p>
                    </div>

                    {step1Error && (
                      <div
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="reset_password.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-destructive text-sm">{step1Error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleRequestOTP}
                      className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                      data-ocid="reset_password.request_otp.button"
                    >
                      Send OTP to my phone
                    </Button>
                  </div>
                )}

                {/* STEP 2: Verify OTP */}
                {step === 2 && (
                  <div>
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
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
                      data-ocid="reset_password.otp.panel"
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
                        data-ocid="reset_password.otp.loading_state"
                      >
                        ⏱ OTP expires in:{" "}
                        <strong>
                          {expirySeconds > 0 ? `${expirySeconds}s` : "Expired"}
                        </strong>
                      </span>
                      <span>
                        Attempts remaining:{" "}
                        <strong
                          className={
                            attemptsLeft <= 1 ? "text-destructive" : ""
                          }
                        >
                          {attemptsLeft}
                        </strong>
                      </span>
                    </div>

                    {/* Error message */}
                    {otpError && (
                      <div
                        className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="reset_password.otp.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-destructive text-sm">{otpError}</p>
                      </div>
                    )}

                    {/* OTP form */}
                    <form
                      onSubmit={handleVerifyOTP}
                      className="space-y-4"
                      data-ocid="reset_password.modal"
                    >
                      <div>
                        <Label
                          htmlFor="reset-otp-input"
                          className="text-brand-blue font-semibold"
                        >
                          4-Digit OTP Code
                        </Label>
                        <Input
                          id="reset-otp-input"
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
                          data-ocid="reset_password.otp.input"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLocked || otpInput.length < 4}
                        className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue disabled:opacity-50"
                        data-ocid="reset_password.otp.submit_button"
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
                        data-ocid="reset_password.resend_otp.button"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {cooldownSeconds > 0
                          ? `Resend in ${cooldownSeconds}s`
                          : "Resend OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-blue transition-colors"
                        data-ocid="reset_password.back.button"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: New Password */}
                {step === 3 && (
                  <div>
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-brand-gold" />
                      New Password
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      OTP verified. Enter and confirm your new password.
                    </p>

                    {passwordError && (
                      <div
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded p-3 mb-4"
                        data-ocid="reset_password.password.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-destructive text-sm">
                          {passwordError}
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-4">
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          New Password
                        </Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          autoComplete="new-password"
                          className="mt-1"
                          data-ocid="reset_password.new_password.input"
                        />
                      </div>
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Confirm Password
                        </Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          required
                          autoComplete="new-password"
                          className="mt-1"
                          data-ocid="reset_password.confirm_password.input"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-11 btn-3d btn-3d-blue"
                        data-ocid="reset_password.submit_button"
                      >
                        Reset Password
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
            to="/admin"
            className="text-white/60 hover:text-white text-sm"
            data-ocid="reset_password.back.link"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
