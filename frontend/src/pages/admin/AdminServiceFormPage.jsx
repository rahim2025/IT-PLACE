import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, X, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { SERVICE_ICON_NAMES, getServiceIcon } from "../../data/serviceIcons";
import SeoFieldsSection from "../../components/admin/SeoFieldsSection";
import { EMPTY_SEO_FIELDS, seoFieldsFromEntity, seoFieldsToPayload } from "../../utils/seoFormFields";

const EMPTY_FORM = {
  title: "",
  summary: "",
  icon: SERVICE_ICON_NAMES[0],
  productCategoryId: "",
  order: "0",
  status: "active",
  ...EMPTY_SEO_FIELDS,
};

export default function AdminServiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [existingImage, setExistingImage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/services/${id}`)
      .then(({ service }) => {
        setForm({
          title: service.title,
          summary: service.summary,
          icon: service.icon,
          productCategoryId: service.productCategoryId || "",
          order: String(service.order ?? 0),
          status: service.status,
          ...seoFieldsFromEntity(service),
        });
        setExistingImage(service.image || "");
        setLoading(false);
      })
      .catch(() => {
        setFormError("Could not load this service.");
        setLoading(false);
      });
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      if (newFile) URL.revokeObjectURL(newFile.previewUrl);
    };
  }, [newFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const addFile = (file) => {
    if (!file.type.startsWith("image/")) return;
    if (newFile) URL.revokeObjectURL(newFile.previewUrl);
    setNewFile({ file, previewUrl: URL.createObjectURL(file) });
    if (errors.image) setErrors((er) => ({ ...er, image: undefined }));
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) addFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) addFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    if (newFile) URL.revokeObjectURL(newFile.previewUrl);
    setNewFile(null);
    setExistingImage("");
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.summary.trim()) next.summary = "Summary is required.";
    if (!form.icon) next.icon = "Please choose an icon.";
    const order = Number(form.order);
    if (form.order === "" || !Number.isFinite(order)) next.order = "Enter a valid display order.";
    if (!existingImage && !newFile) next.image = "Add an image for this service.";
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

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("summary", form.summary.trim());
    body.append("icon", form.icon);
    body.append("productCategoryId", form.productCategoryId);
    body.append("order", form.order);
    body.append("status", form.status);
    if (newFile) body.append("image", newFile.file);
    Object.entries(seoFieldsToPayload(form)).forEach(([key, value]) => body.append(key, value));

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/services/${id}`, body, { isFormData: true });
      } else {
        await api.post("/services", body, { isFormData: true });
      }
      toast.success(isEdit ? "Service updated successfully." : "Service added successfully.");
      navigate("/admin/services");
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

  const PreviewIcon = getServiceIcon(form.icon);
  const imagePreview = newFile?.previewUrl || existingImage;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? "Edit Service" : "Add Service"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEdit ? "Update this service. Changes appear on the homepage carousel immediately." : "Add a new service to the homepage carousel."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div>
            <label htmlFor="field-title" className="block text-sm font-medium text-secondary">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="field-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              aria-invalid={Boolean(errors.title)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            />
            {errors.title && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="field-summary" className="block text-sm font-medium text-secondary">
              Summary <span className="text-destructive">*</span>
            </label>
            <textarea
              id="field-summary"
              name="summary"
              rows={4}
              value={form.summary}
              onChange={handleChange}
              aria-invalid={Boolean(errors.summary)}
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            />
            {errors.summary && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.summary}</p>}
          </div>

          <div>
            <label htmlFor="field-productCategoryId" className="block text-sm font-medium text-secondary">
              Linked Product Category <span className="text-muted-foreground">(optional)</span>
            </label>
            <select
              id="field-productCategoryId"
              name="productCategoryId"
              value={form.productCategoryId}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              "View Products" on this service will link to this category's catalog page.
            </p>
          </div>

          <div>
            <p className="block text-sm font-medium text-secondary">
              Service Image <span className="text-destructive">*</span>
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mt-1.5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragging ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <UploadCloud size={28} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop an image here, or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-primary hover:bg-muted cursor-pointer"
              >
                Browse Files
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileInput} />
            </div>
            {errors.image && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.image}</p>}

            {imagePreview && (
              <div className="group relative mt-4 aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-muted">
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold text-primary">Icon</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <PreviewIcon size={20} />
              </span>
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              >
                {SERVICE_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {errors.icon && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.icon}</p>}
          </div>

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
            <p className="mt-1.5 text-xs text-muted-foreground">Lower numbers appear first in the carousel.</p>
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

          <SeoFieldsSection values={form} onChange={handleChange} errors={errors} />

          {formError && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <AlertCircle size={16} className="shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/services")}
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
              {isEdit ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
