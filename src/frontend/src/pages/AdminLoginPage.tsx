import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminPassword } from "@/lib/storage";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Login - ID&PC Chak";
    if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const correctPassword = getAdminPassword();
    if (username === "Kamran911" && password === correctPassword) {
      sessionStorage.setItem("isAdminLoggedIn", "true");
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Invalid username or password. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-brand-blue font-heading font-bold text-xl">
              ID&PC
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-white">
            Admin Panel
          </h1>
          <p className="text-white/60 mt-1">
            Ihsan Designing & Printing Center Chak
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <h2 className="font-heading font-bold text-xl text-brand-blue mb-6">
              Sign In
            </h2>

            {error && (
              <div
                className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4"
                data-ocid="admin_login.error_state"
              >
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-destructive text-sm">{error}</p>
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
                    data-ocid="admin_login.password.input"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12"
                data-ocid="admin_login.submit_button"
              >
                Login to Admin Panel
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
