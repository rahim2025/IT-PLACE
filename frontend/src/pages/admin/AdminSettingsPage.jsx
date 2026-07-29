import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const EMPTY_FORM = {
  businessName: "",
  logo: "",
  description: "",
  address: "",
  city: "",
  region: "",
  country: "",
  countryCode: "",
  postalCode: "",
  serviceAreas: "",
  phone: "",
  email: "",
  whatsapp: "",
  googleMapsUrl: "",
  latitude: "",
  longitude: "",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  youtube: "",
};

function Field({ label, name, value, onChange, placeholder, hint, type = "text" }) {
  return (
    <div>
      <label htmlFor={`settings-${name}`} className="block text-sm font-medium text-secondary">
        {label}
      </label>
      <input
        id={`settings-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api
      .get("/settings")
      .then(({ settings }) => {
        setForm({
          businessName: settings.businessName || "",
          logo: settings.logo || "",
          description: settings.description || "",
          address: settings.address || "",
          city: settings.city || "",
          region: settings.region || "",
          country: settings.country || "",
          countryCode: settings.countryCode || "",
          postalCode: settings.postalCode || "",
          serviceAreas: (settings.serviceAreas || []).join(", "),
          phone: settings.phone || "",
          email: settings.email || "",
          whatsapp: settings.whatsapp || "",
          googleMapsUrl: settings.googleMapsUrl || "",
          latitude: settings.latitude != null ? String(settings.latitude) : "",
          longitude: settings.longitude != null ? String(settings.longitude) : "",
          facebook: settings.socialProfiles?.facebook || "",
          instagram: settings.socialProfiles?.instagram || "",
          twitter: settings.socialProfiles?.twitter || "",
          linkedin: settings.socialProfiles?.linkedin || "",
          youtube: settings.socialProfiles?.youtube || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setFormError("Could not load business settings.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.put("/settings", {
        businessName: form.businessName.trim(),
        logo: form.logo.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        country: form.country.trim(),
        countryCode: form.countryCode.trim(),
        postalCode: form.postalCode.trim(),
        serviceAreas: form.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
        phone: form.phone.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        googleMapsUrl: form.googleMapsUrl.trim(),
        latitude: form.latitude.trim(),
        longitude: form.longitude.trim(),
        socialProfiles: {
          facebook: form.facebook.trim(),
          instagram: form.instagram.trim(),
          twitter: form.twitter.trim(),
          linkedin: form.linkedin.trim(),
          youtube: form.youtube.trim(),
        },
      });
      toast.success("Business settings saved.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary">Business Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This information powers Organization/LocalBusiness structured data and SEO fallbacks across the site — fill in what
        you have; anything left blank is simply omitted from the schema.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-bold text-primary">Business Identity</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="ITPlace" />
            <Field label="Logo URL" name="logo" value={form.logo} onChange={handleChange} placeholder="/uploads/settings/logo.webp" />
            <div className="sm:col-span-2">
              <label htmlFor="settings-description" className="block text-sm font-medium text-secondary">
                Description
              </label>
              <textarea
                id="settings-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-bold text-primary">Location</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Street Address" name="address" value={form.address} onChange={handleChange} placeholder="Olaya St, Al Olaya" />
            </div>
            <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Riyadh" />
            <Field label="Region" name="region" value={form.region} onChange={handleChange} placeholder="Riyadh Region" />
            <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="Saudi Arabia" />
            <Field label="Country Code" name="countryCode" value={form.countryCode} onChange={handleChange} placeholder="SA" />
            <Field label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} />
            <Field label="Google Maps URL" name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} />
            <Field label="Latitude" name="latitude" type="number" value={form.latitude} onChange={handleChange} />
            <Field label="Longitude" name="longitude" type="number" value={form.longitude} onChange={handleChange} />
            <div className="sm:col-span-2">
              <Field
                label="Service Areas"
                name="serviceAreas"
                value={form.serviceAreas}
                onChange={handleChange}
                placeholder="Riyadh, Jeddah, Dammam"
                hint="Comma-separated. Used for LocalBusiness areaServed once populated."
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-bold text-primary">Contact</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+966 5X XXX XXXX" />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field label="WhatsApp" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+966595818116" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-bold text-primary">Social Profiles</h2>
          <p className="mt-1 text-xs text-muted-foreground">Populates the Organization schema's sameAs list.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} />
            <Field label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} />
            <Field label="Twitter / X" name="twitter" value={form.twitter} onChange={handleChange} />
            <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} />
            <Field label="YouTube" name="youtube" value={form.youtube} onChange={handleChange} />
          </div>
        </div>

        {formError && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            {formError}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
