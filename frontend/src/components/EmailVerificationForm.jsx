import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../utils/api";

export default function EmailVerificationForm({ email: initialEmail = "", editableEmail = false, onVerified }) {
  const { verifyEmail, resendVerification } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [resendState, setResendState] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code we emailed you.");
      return;
    }

    setStatus("loading");
    try {
      const user = await verifyEmail(email.trim(), code.trim());
      onVerified?.(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setResendState("loading");
    try {
      await resendVerification(email.trim());
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {editableEmail && (
        <div>
          <label htmlFor="verify-email" className="block text-sm font-medium text-secondary">
            Email Address
          </label>
          <input
            id="verify-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
          />
        </div>
      )}

      <div>
        <label htmlFor="verify-code" className="block text-sm font-medium text-secondary">
          Verification Code
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground outline-none transition-colors focus:border-accent"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">Enter the 6-digit code sent to your email. It expires in 15 minutes.</p>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {status === "loading" && <Loader2 size={18} className="animate-spin" />}
        {status === "loading" ? "Verifying..." : "Verify Email"}
      </button>

      {error && (
        <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={resendState !== "idle"}
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-accent hover:text-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {resendState === "loading" && <Loader2 size={14} className="animate-spin" />}
        {resendState === "sent" ? "Code resent — check your inbox" : "Resend code"}
      </button>
    </form>
  );
}
