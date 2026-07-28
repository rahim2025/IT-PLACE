import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../utils/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle");

  const validate = () => {
    const next = {};
    if (!password) {
      next.password = "Please enter a new password.";
    } else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      next.password = "Password must be at least 8 characters and include a letter and a number.";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
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
      await resetPassword(token, password, confirmPassword);
      setStatus("success");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
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
          {status === "success" ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 size={28} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-primary">Password reset</h1>
              <p className="mt-2 text-sm text-muted-foreground">Taking you to the login page...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-primary md:text-3xl">Set a new password</h1>
              <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                <div>
                  <label htmlFor="field-password" className="block text-sm font-medium text-secondary">
                    New Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="field-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((er) => ({ ...er, password: undefined }));
                      }}
                      aria-invalid={Boolean(errors.password)}
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
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-confirmPassword" className="block text-sm font-medium text-secondary">
                    Confirm New Password <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="field-confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((er) => ({ ...er, confirmPassword: undefined }));
                    }}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                  />
                  {errors.confirmPassword && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
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
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </button>

                {formError && (
                  <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle size={18} />
                    {formError}
                  </p>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-accent hover:text-accent-light">
                  Back to log in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
