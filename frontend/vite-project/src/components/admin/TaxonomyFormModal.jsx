import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

export default function TaxonomyFormModal({ open, mode, label, initial, onSubmit, onClose }) {
  const readOnly = mode === "view";
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setStatus(initial?.status || "active");
    setError("");
    setSaving(false);
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return onClose();
    if (!name.trim()) {
      setError(`${label} name is required.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), status });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const title = mode === "add" ? `Add ${label}` : mode === "edit" ? `Edit ${label}` : label;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
            <div>
              <label htmlFor="taxonomy-name" className="block text-sm font-medium text-secondary">
                {label} Name {!readOnly && <span className="text-destructive">*</span>}
              </label>
              <input
                id="taxonomy-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={readOnly}
                autoFocus={!readOnly}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-70"
              />
            </div>

            {readOnly && initial?.slug && (
              <div>
                <p className="block text-sm font-medium text-secondary">Slug</p>
                <p className="mt-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
                  {initial.slug}
                </p>
              </div>
            )}

            <div>
              <p className="block text-sm font-medium text-secondary">Status</p>
              <div className="mt-1.5 flex gap-2">
                {["active", "inactive"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors disabled:cursor-not-allowed ${
                      status === s
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-secondary hover:enabled:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer"
              >
                {readOnly ? "Close" : "Cancel"}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {mode === "add" ? "Create" : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
