import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAdminPassword } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import { useEffect, useState } from "react";

const SECURITY_QUESTIONS = [
  { id: "q1", question: "Shop kab khula? (Year)", answer: "2015" },
  { id: "q2", question: "Shop ka CEO kon hai?", answer: "Kamran" },
  { id: "q3", question: "Kitne employees hain? (Number)", answer: "5" },
];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - ID&PC Chak";
  }, []);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const allCorrect = SECURITY_QUESTIONS.every(
      (q, i) => answers[i].trim().toLowerCase() === q.answer.toLowerCase(),
    );
    if (allCorrect) {
      setError("");
      setStep(2);
    } else {
      setError("One or more answers are incorrect. Please try again.");
    }
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setAdminPassword(newPassword);
    setSuccess(true);
    setTimeout(() => navigate({ to: "/admin" }), 3000);
  }

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-brand-blue" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Reset Password
          </h1>
          <p className="text-white/60 mt-1">
            Answer security questions to reset
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
            ) : step === 1 ? (
              <div>
                <h2 className="font-heading font-bold text-lg text-brand-blue mb-1">
                  Step 1: Security Questions
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Answer all 3 questions correctly to proceed.
                </p>

                {error && (
                  <div
                    className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded p-3 mb-4"
                    data-ocid="reset_password.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <form
                  onSubmit={handleVerify}
                  className="space-y-4"
                  data-ocid="reset_password.modal"
                >
                  {SECURITY_QUESTIONS.map((q, i) => (
                    <div key={q.id}>
                      <Label className="text-brand-blue font-semibold text-sm">
                        {q.question}
                      </Label>
                      <Input
                        value={answers[i]}
                        onChange={(e) =>
                          setAnswers((prev) =>
                            prev.map((a, j) => (j === i ? e.target.value : a)),
                          )
                        }
                        placeholder="Your answer"
                        required
                        className="mt-1"
                        data-ocid={`reset_password.answer_${i + 1}.input`}
                      />
                    </div>
                  ))}
                  <Button
                    type="submit"
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-11"
                    data-ocid="reset_password.verify.submit_button"
                  >
                    Verify Answers
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="font-heading font-bold text-lg text-brand-blue mb-1">
                  Step 2: New Password
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter and confirm your new password.
                </p>

                {passwordError && (
                  <div
                    className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded p-3 mb-4"
                    data-ocid="reset_password.password.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-destructive text-sm">{passwordError}</p>
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
                      className="mt-1"
                      data-ocid="reset_password.confirm_password.input"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-11"
                    data-ocid="reset_password.submit_button"
                  >
                    Reset Password
                  </Button>
                </form>
              </div>
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
