import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import EmailVerificationForm from "../components/EmailVerificationForm";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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
            <h1 className="mt-5 text-2xl font-extrabold text-primary">Verify your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code we emailed you to activate your account.
            </p>
          </div>

          <div className="mt-6">
            <EmailVerificationForm
              email={email}
              editableEmail={!email}
              onVerified={() => navigate("/", { replace: true })}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
