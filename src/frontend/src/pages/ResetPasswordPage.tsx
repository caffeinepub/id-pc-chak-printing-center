import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { fetchSecurityAnswers } from "@/lib/backendData";
import { setAdminPassword } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lock,
  ShieldQuestion,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

type ResetStep = 1 | 2 | 3;

// Default security answers (stored in backend)
const DEFAULT_SECURITY_ANSWERS = {
  answer1: "24-07-2004",
  answer2: "4330384851864",
  answer3: "03113639008",
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [step, setStep] = useState<ResetStep>(1);

  // Step 1: Verify username
  const [usernameInput, setUsernameInput] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Step 2: Security questions
  const [ans1, setAns1] = useState("");
  const [ans2, setAns2] = useState("");
  const [ans3, setAns3] = useState("");
  const [questionsError, setQuestionsError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Step 3: New password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - ID&PC Chak";
  }, []);

  function handleVerifyUsername(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error("");
    if (usernameInput.trim() !== "Kamran911") {
      setStep1Error("Username not recognized. Please try again.");
      return;
    }
    setStep(2);
  }

  async function handleVerifyAnswers(e: React.FormEvent) {
    e.preventDefault();
    setQuestionsError("");
    setVerifying(true);
    try {
      // Fetch stored security answers from backend (or use defaults)
      let stored = DEFAULT_SECURITY_ANSWERS;
      const backendAnswers = await fetchSecurityAnswers(actor);
      if (backendAnswers?.answer1) {
        stored = {
          answer1: backendAnswers.answer1,
          answer2: backendAnswers.answer2,
          answer3: backendAnswers.answer3,
        };
      }

      const normalize = (s: string) =>
        s.trim().toLowerCase().replace(/\s+/g, "");

      const a1Match = normalize(ans1) === normalize(stored.answer1);
      const a2Match = normalize(ans2) === normalize(stored.answer2);
      const a3Match = normalize(ans3) === normalize(stored.answer3);

      if (!a1Match || !a2Match || !a3Match) {
        setQuestionsError(
          "Incorrect answers. Please check all 3 answers and try again.",
        );
        return;
      }

      setStep(3);
    } catch (err) {
      console.error("Security question verify error", err);
      setQuestionsError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  function handleResetPassword(e: React.FormEvent) {
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
    if (actor) {
      actor
        .setAdminPassword(newPassword)
        .catch((err) => console.warn("setAdminPassword backend error", err));
    }
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
            Answer security questions to reset your password
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
                  Your password has been changed. Redirecting to login...
                </p>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {stepLabels[step]}
                </p>

                {/* STEP 1: Verify username */}
                {step === 1 && (
                  <div>
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
                      <User className="w-5 h-5 text-brand-gold" />
                      Verify Admin Username
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Enter your admin username to begin the reset process.
                    </p>

                    {step1Error && (
                      <div
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="reset_password.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-destructive text-sm">{step1Error}</p>
                      </div>
                    )}

                    <form onSubmit={handleVerifyUsername} className="space-y-4">
                      <div>
                        <Label className="text-brand-blue font-semibold">
                          Admin Username
                        </Label>
                        <Input
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Enter your username"
                          required
                          autoComplete="username"
                          className="mt-1"
                          data-ocid="reset_password.username.input"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                        data-ocid="reset_password.username.submit_button"
                      >
                        Continue
                      </Button>
                    </form>
                  </div>
                )}

                {/* STEP 2: Security Questions */}
                {step === 2 && (
                  <div>
                    <h2 className="font-heading font-bold text-lg text-brand-blue mb-1 flex items-center gap-2">
                      <ShieldQuestion className="w-5 h-5 text-brand-gold" />
                      Security Questions
                    </h2>
                    <p className="text-muted-foreground text-sm mb-5">
                      Answer all 3 questions correctly to proceed.
                    </p>

                    {questionsError && (
                      <div
                        className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                        data-ocid="reset_password.questions.error_state"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-destructive text-sm">
                          {questionsError}
                        </p>
                      </div>
                    )}

                    <form
                      onSubmit={handleVerifyAnswers}
                      className="space-y-5"
                      data-ocid="reset_password.questions.modal"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-brand-blue font-semibold flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
                          What is your Girlfriend&apos;s Date of Birth?
                        </Label>
                        <Input
                          value={ans1}
                          onChange={(e) => setAns1(e.target.value)}
                          placeholder="Enter your answer"
                          required
                          className="mt-1"
                          data-ocid="reset_password.answer1.input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-brand-blue font-semibold flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
                          What is your Mother&apos;s CNIC Number?
                        </Label>
                        <Input
                          value={ans2}
                          onChange={(e) => setAns2(e.target.value)}
                          placeholder="Enter your answer"
                          required
                          className="mt-1"
                          data-ocid="reset_password.answer2.input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-brand-blue font-semibold flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
                          What was your First Mobile Number?
                        </Label>
                        <Input
                          value={ans3}
                          onChange={(e) => setAns3(e.target.value)}
                          placeholder="Enter your answer"
                          required
                          className="mt-1"
                          data-ocid="reset_password.answer3.input"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={verifying}
                        className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12 btn-3d btn-3d-blue"
                        data-ocid="reset_password.verify_answers.submit_button"
                      >
                        {verifying ? "Verifying..." : "Verify Answers"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-blue transition-colors"
                        data-ocid="reset_password.back.button"
                      >
                        ← Back
                      </button>
                    </form>
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
                      Identity verified. Enter your new password.
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

                    <form onSubmit={handleResetPassword} className="space-y-4">
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
