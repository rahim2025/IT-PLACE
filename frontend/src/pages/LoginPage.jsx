import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../utils/api";

const EMPTY_FORM = { email: "", password: "" };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Please enter your email.";
    if (!form.password) next.password = "Please enter your password.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setNeedsVerification(false);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    try {
      await login({ email: form.email.trim(), password: form.password, rememberMe });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      }
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center bg-background py-16 md:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl md:p-8"
        >
          <h1 className="text-2xl font-extrabold text-primary md:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in to manage your orders, wishlist, and account.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="field-email" className="block text-sm font-medium text-secondary">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="field-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "error-email" : undefined}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
              />
              {errors.email && (
                <p id="error-email" role="alert" className="mt-1.5 text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="field-password" className="block text-sm font-medium text-secondary">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="field-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "error-password" : undefined}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-11 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="error-password" role="alert" className="mt-1.5 text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-accent hover:text-accent-light">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {status === "loading" && <Loader2 size={18} className="animate-spin" />}
              {status === "loading" ? "Logging in..." : "Log In"}
            </button>

            {formError && (
              <div>
                <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle size={18} />
                  {formError}
                </p>
                {needsVerification && (
                  <button
                    type="button"
                    onClick={() => navigate("/verify-email", { state: { email: form.email.trim() } })}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light cursor-pointer"
                  >
                    Enter verification code
                  </button>
                )}
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-accent hover:text-accent-light">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
