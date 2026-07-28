import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../utils/api";
import EmailVerificationForm from "../components/EmailVerificationForm";

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "" };

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Please enter a password.";
    } else if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = "Password must be at least 8 characters and include a letter and a number.";
    }
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    try {
      const data = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSentTo(data.email);
      setStatus("sent");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center bg-background py-16 md:py-24">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl md:p-8"
          >
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MailCheck size={28} />
              </span>
              <h1 className="mt-5 text-2xl font-extrabold text-primary">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a 6-digit verification code to <span className="font-semibold text-primary">{sentTo}</span>.
              </p>
            </div>

            <div className="mt-6">
              <EmailVerificationForm email={sentTo} onVerified={() => navigate("/", { replace: true })} />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-accent hover:text-accent-light">
                Back to log in
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center bg-background py-16 md:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl md:p-8"
        >
          <h1 className="text-2xl font-extrabold text-primary md:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to track orders, save your wishlist, and check out faster.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="field-name" className="block text-sm font-medium text-secondary">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="field-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "error-name" : undefined}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
              />
              {errors.name && (
                <p id="error-name" role="alert" className="mt-1.5 text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "error-password" : "hint-password"}
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
              {errors.password ? (
                <p id="error-password" role="alert" className="mt-1.5 text-sm text-destructive">
                  {errors.password}
                </p>
              ) : (
                <p id="hint-password" className="mt-1.5 text-xs text-muted-foreground">
                  At least 8 characters, with a letter and a number.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="field-confirmPassword" className="block text-sm font-medium text-secondary">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="field-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? "error-confirmPassword" : undefined}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-11 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-primary cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="error-confirmPassword" role="alert" className="mt-1.5 text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {status === "loading" && <Loader2 size={18} className="animate-spin" />}
              {status === "loading" ? "Creating account..." : "Create Account"}
            </button>

            {formError && (
              <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle size={18} />
                {formError}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-light">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
