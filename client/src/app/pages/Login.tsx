import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { FlaskConical, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login as loginThunk } from "../../store/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading: isLoading, error: authError } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        navigate("/dashboard");
      } else if (loginThunk.rejected.match(result)) {
        setError(result.payload as string);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2 bg-background">
      {/* Left side - Branding */}
      <div className="hidden sm:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
            <FlaskConical size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">MedInvestigate</h1>
          <p className="text-blue-100 text-lg">
            AI-Powered Medical Device Incident Investigation
          </p>
          <div className="mt-12 space-y-4 text-left max-w-xs">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-800 text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-blue-50">
                  Intelligent Analysis
                </div>
                <div className="text-blue-200 text-sm">
                  AI-driven investigation with multi-agent coordination
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-800 text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-blue-50">
                  Regulatory Compliance
                </div>
                <div className="text-blue-200 text-sm">
                  FDA 21 CFR Part 803 & EU MDR ready
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-800 text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-blue-50">
                  Real-Time Insights
                </div>
                <div className="text-blue-200 text-sm">
                  Live agent activity and instant report generation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="sm:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FlaskConical size={24} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              MedInvestigate
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI Incident Investigation
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  defaultChecked
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Demo credentials: sarah@clinic.org / password
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create one
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Protected by enterprise-grade security. FDA & HIPAA compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
