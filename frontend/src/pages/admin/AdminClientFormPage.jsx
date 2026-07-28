import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const EMPTY_FORM = { name: "", location: "", work: "", order: "0", status: "active" };

export default function AdminClientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/clients/${id}`)
      .then(({ client }) => {
        setForm({
          name: client.name,
          location: client.location,
          work: client.work,
          order: String(client.order ?? 0),
          status: client.status,
        });
        setLoading(false);
      })
      .catch(() => {
        setFormError("Could not load this client.");
        setLoading(false);
      });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Client name is required.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.work.trim()) next.work = "Please describe the work delivered.";
    const order = Number(form.order);
    if (form.order === "" || !Number.isFinite(order)) next.order = "Enter a valid display order.";
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

    const body = {
      name: form.name.trim(),
      location: form.location.trim(),
      work: form.work.trim(),
      order: form.order,
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/clients/${id}`, body);
      } else {
        await api.post("/clients", body);
      }
      toast.success(isEdit ? "Client updated successfully." : "Client added successfully.");
      navigate("/admin/clients");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
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
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? "Edit Client" : "Add Client"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEdit ? "Update this client. Changes appear on the homepage immediately." : "Add a client testimonial to the homepage."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="field-name" className="block text-sm font-medium text-secondary">
                Client Name <span className="text-destructive">*</span>
              </label>
              <input
                id="field-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.name && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="field-location" className="block text-sm font-medium text-secondary">
                Location <span className="text-destructive">*</span>
              </label>
              <input
                id="field-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                aria-invalid={Boolean(errors.location)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.location && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.location}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="field-work" className="block text-sm font-medium text-secondary">
              Work Delivered <span className="text-destructive">*</span>
            </label>
            <textarea
              id="field-work"
              name="work"
              rows={4}
              value={form.work}
              onChange={handleChange}
              aria-invalid={Boolean(errors.work)}
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            />
            {errors.work && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.work}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold text-primary">Display Order</h2>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              aria-invalid={Boolean(errors.order)}
              className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Lower numbers appear first.</p>
            {errors.order && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.order}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold text-primary">Status</h2>
            <div className="mt-3 flex gap-2">
              {["active", "inactive"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                    form.status === s
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-secondary hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <AlertCircle size={16} className="shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/clients")}
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-primary hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Client"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
