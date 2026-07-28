import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email.trim());
    } finally {
      // Always show the same generic confirmation, whether or not the
      // email matched an account — the backend deliberately doesn't say.
      setLoading(false);
      setSubmitted(true);
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
          <h1 className="text-2xl font-extrabold text-primary md:text-3xl">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your account email and we'll send you a link to reset your password.
          </p>

          {submitted ? (
            <p role="status" className="mt-8 flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 size={18} />
              If an account exists for that email, a reset link is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
              <div>
                <label htmlFor="field-email" className="block text-sm font-medium text-secondary">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

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
