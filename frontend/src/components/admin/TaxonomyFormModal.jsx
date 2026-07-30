import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import SeoFieldsSection from "./SeoFieldsSection";
import { EMPTY_SEO_FIELDS, seoFieldsFromEntity, seoFieldsToPayload } from "../../utils/seoFormFields";

const EMPTY_FORM = { name: "", status: "active", description: "", image: "", ...EMPTY_SEO_FIELDS };

export default function TaxonomyFormModal({ open, mode, label, imageField = "image", initial, onSubmit, onClose }) {
  const readOnly = mode === "view";
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initial?.name || "",
      status: initial?.status || "active",
      description: initial?.description || "",
      image: initial?.[imageField] || "",
      ...seoFieldsFromEntity(initial),
    });
    setError("");
    setFieldErrors({});
    setSaving(false);
  }, [open, initial, imageField]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return onClose();
    if (!form.name.trim()) {
      setError(`${label} name is required.`);
      return;
    }
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await onSubmit({
        name: form.name.trim(),
        status: form.status,
        description: form.description.trim(),
        [imageField]: form.image.trim(),
        ...seoFieldsToPayload(form),
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
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
          className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl"
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
                name="name"
                value={form.name}
                onChange={handleChange}
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
              <label htmlFor="taxonomy-description" className="block text-sm font-medium text-secondary">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="taxonomy-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                disabled={readOnly}
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-70"
              />
            </div>

            <div>
              <label htmlFor="taxonomy-image" className="block text-sm font-medium text-secondary">
                {imageField === "logo" ? "Logo URL" : "Image URL"} <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="taxonomy-image"
                name="image"
                value={form.image}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="/uploads/products/example.webp"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-70"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-secondary">Status</p>
              <div className="mt-1.5 flex gap-2">
                {["active", "inactive"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors disabled:cursor-not-allowed ${
                      form.status === s
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-secondary hover:enabled:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <SeoFieldsSection values={form} onChange={handleChange} disabled={readOnly} errors={fieldErrors} />

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
