import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, LogOut, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../utils/api";
import SectionHeading from "../components/SectionHeading";

const EMPTY_PASSWORD_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function ChangePasswordCard() {
  const { updatePassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Please enter your current password.";
    if (!form.newPassword) {
      next.newPassword = "Please enter a new password.";
    } else if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/[0-9]/.test(form.newPassword)) {
      next.newPassword = "Password must be at least 8 characters and include a letter and a number.";
    }
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await updatePassword(form.currentPassword, form.newPassword, form.confirmPassword);
      toast.success("Your password has been updated.");
      setForm(EMPTY_PASSWORD_FORM);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <KeyRound size={18} />
        </span>
        <h2 className="text-base font-bold text-primary">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
        <div>
          <label htmlFor="field-currentPassword" className="block text-sm font-medium text-secondary">
            Current Password
          </label>
          <input
            id="field-currentPassword"
            name="currentPassword"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={handleChange}
            aria-invalid={Boolean(errors.currentPassword)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
          {errors.currentPassword && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="field-newPassword" className="block text-sm font-medium text-secondary">
              New Password
            </label>
            <input
              id="field-newPassword"
              name="newPassword"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.newPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.newPassword)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
            {errors.newPassword && (
              <p role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-confirmNewPassword" className="block text-sm font-medium text-secondary">
              Confirm New Password
            </label>
            <input
              id="field-confirmNewPassword"
              name="confirmPassword"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirmPassword)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
            {errors.confirmPassword && (
              <p role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary cursor-pointer"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
            {show ? "Hide passwords" : "Show passwords"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading eyebrow="Account" title="My Profile" align="left" />

        <div className="mt-10 max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <User size={26} />
            </span>
            <div>
              <p className="text-lg font-bold text-primary">{user.name}</p>
              {user.role === "admin" && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  <ShieldCheck size={12} /> Admin
                </span>
              )}
            </div>
          </div>

          <dl className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Email Address</dt>
                <dd className="text-sm font-semibold text-primary">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Member Since</dt>
                <dd className="text-sm font-semibold text-primary">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5 cursor-pointer"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

        <ChangePasswordCard />
      </div>
    </section>
  );
}
