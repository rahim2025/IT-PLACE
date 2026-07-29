import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

function Field({ as = "input", label, name, value, onChange, placeholder, rows, disabled }) {
  const Component = as;
  return (
    <div>
      <label htmlFor={`seo-${name}`} className="block text-sm font-medium text-secondary">
        {label}
      </label>
      <Component
        id={`seo-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={as === "textarea" ? rows : undefined}
        disabled={disabled}
        className={`mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-70 ${
          as === "textarea" ? "resize-none" : ""
        }`}
      />
    </div>
  );
}

// Shared collapsible "SEO" fieldset reused across the Product/Category/
// Brand/Service admin forms. Every field is optional — the frontend SEO
// layer auto-generates sensible defaults from the entity's normal content
// whenever these are left blank, so admins only need this for overrides.
export default function SeoFieldsSection({ values, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-primary">
          <Search size={16} className="text-accent" aria-hidden="true" />
          SEO Settings <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <p className="mt-1 text-xs text-muted-foreground">Leave blank to auto-generate from the details above.</p>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <Field label="SEO Title" name="seoTitle" value={values.seoTitle} onChange={onChange} placeholder="Auto-generated if left blank" disabled={disabled} />
          <Field
            as="textarea"
            rows={3}
            label="Meta Description"
            name="seoDescription"
            value={values.seoDescription}
            onChange={onChange}
            placeholder="Auto-generated if left blank"
            disabled={disabled}
          />
          <Field
            label="Focus Keywords"
            name="seoKeywords"
            value={values.seoKeywords}
            onChange={onChange}
            placeholder="comma, separated, keywords"
            disabled={disabled}
          />
          <Field
            label="Canonical URL"
            name="canonicalUrl"
            value={values.canonicalUrl}
            onChange={onChange}
            placeholder="Auto-generated if left blank"
            disabled={disabled}
          />
          <Field label="Open Graph Image URL" name="ogImage" value={values.ogImage} onChange={onChange} placeholder="Defaults to the main image" disabled={disabled} />
          <Field label="Social Share Title" name="socialTitle" value={values.socialTitle} onChange={onChange} placeholder="Defaults to SEO Title" disabled={disabled} />
          <Field
            as="textarea"
            rows={2}
            label="Social Share Description"
            name="socialDescription"
            value={values.socialDescription}
            onChange={onChange}
            placeholder="Defaults to Meta Description"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
