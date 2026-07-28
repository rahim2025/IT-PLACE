import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, X, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import CreatableSelect from "../../components/admin/CreatableSelect";

const EMPTY_FORM = {
  name: "",
  category: null,
  brand: null,
  price: "",
  discountPrice: "",
  sku: "",
  stock: "",
  description: "",
  tags: "",
  status: "active",
  featured: false,
  bestSeller: false,
  newArrival: false,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then(({ product }) => {
        setForm({
          name: product.name,
          category: { name: product.category, slug: product.categoryId },
          brand: { name: product.brand },
          price: String(product.regularPrice ?? product.price),
          discountPrice: product.discountPrice != null ? String(product.discountPrice) : "",
          sku: product.sku,
          stock: String(product.stock),
          description: product.description || "",
          tags: (product.tags || []).join(", "),
          status: product.status,
          featured: product.isFeatured,
          bestSeller: product.isBestSeller,
          newArrival: product.isNew,
        });
        setExistingImages(product.images || []);
        setLoading(false);
      })
      .catch(() => {
        setFormError("Could not load this product.");
        setLoading(false);
      });
  }, [id, isEdit]);

  useEffect(() => {
    return () => newFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
  }, [newFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const addFiles = (fileList) => {
    const totalCount = existingImages.length + newFiles.length + fileList.length;
    if (totalCount > 8) {
      setFormError("You can upload up to 8 images per product.");
      return;
    }
    const accepted = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setNewFiles((prev) => [...prev, ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeExistingImage = (url) => setExistingImages((prev) => prev.filter((u) => u !== url));
  const removeNewFile = (previewUrl) =>
    setNewFiles((prev) => {
      const target = prev.find((f) => f.previewUrl === previewUrl);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.previewUrl !== previewUrl);
    });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.category) next.category = "Category is required.";
    if (!form.brand) next.brand = "Brand is required.";
    if (!form.sku.trim()) next.sku = "SKU is required.";
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price < 0) next.price = "Enter a valid price.";
    if (form.discountPrice) {
      const discount = Number(form.discountPrice);
      if (!Number.isFinite(discount) || discount < 0) next.discountPrice = "Enter a valid discount price.";
      else if (Number.isFinite(price) && discount >= price) next.discountPrice = "Must be lower than the regular price.";
    }
    const stock = Number(form.stock);
    if (form.stock === "" || !Number.isFinite(stock) || stock < 0) next.stock = "Enter a valid stock quantity.";
    if (existingImages.length + newFiles.length === 0) next.images = "Add at least one product image.";
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
    body.append("name", form.name.trim());
    body.append("categoryId", form.category.slug || form.category.name);
    body.append("category", form.category.name);
    body.append("brand", form.brand.name);
    body.append("price", form.price);
    body.append("discountPrice", form.discountPrice);
    body.append("sku", form.sku.trim());
    body.append("stock", form.stock);
    body.append("description", form.description.trim());
    body.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    body.append("status", form.status);
    body.append("featured", form.featured);
    body.append("bestSeller", form.bestSeller);
    body.append("newArrival", form.newArrival);
    body.append("existingImages", JSON.stringify(existingImages));
    newFiles.forEach((f) => body.append("images", f.file));

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, body, { isFormData: true });
      } else {
        await api.post("/products", body, { isFormData: true });
      }
      toast.success(isEdit ? "Product updated successfully." : "Product added successfully.");
      navigate("/admin/products");
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
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? "Edit Product" : "Add Product"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEdit ? "Update this product's details. Changes only affect this listing." : "Fill in the details to add a new product to the catalog."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="field-name" className="block text-sm font-medium text-secondary">
                Product Name <span className="text-destructive">*</span>
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
              <p className="block text-sm font-medium text-secondary">
                Category <span className="text-destructive">*</span>
              </p>
              <div className="mt-1.5">
                <CreatableSelect
                  apiPath="/categories"
                  plural="categories"
                  label="category"
                  value={form.category?.name || ""}
                  onSelect={(item) => {
                    setForm((f) => ({ ...f, category: item }));
                    if (errors.category) setErrors((er) => ({ ...er, category: undefined }));
                  }}
                  error={errors.category}
                />
              </div>
            </div>

            <div>
              <p className="block text-sm font-medium text-secondary">
                Brand <span className="text-destructive">*</span>
              </p>
              <div className="mt-1.5">
                <CreatableSelect
                  apiPath="/brands"
                  plural="brands"
                  label="brand"
                  value={form.brand?.name || ""}
                  onSelect={(item) => {
                    setForm((f) => ({ ...f, brand: item }));
                    if (errors.brand) setErrors((er) => ({ ...er, brand: undefined }));
                  }}
                  error={errors.brand}
                />
              </div>
            </div>

            <div>
              <label htmlFor="field-price" className="block text-sm font-medium text-secondary">
                Price (SAR) <span className="text-destructive">*</span>
              </label>
              <input
                id="field-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                aria-invalid={Boolean(errors.price)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.price && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="field-discountPrice" className="block text-sm font-medium text-secondary">
                Discount Price <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="field-discountPrice"
                name="discountPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.discountPrice}
                onChange={handleChange}
                aria-invalid={Boolean(errors.discountPrice)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.discountPrice && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.discountPrice}</p>}
            </div>

            <div>
              <label htmlFor="field-sku" className="block text-sm font-medium text-secondary">
                SKU <span className="text-destructive">*</span>
              </label>
              <input
                id="field-sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                aria-invalid={Boolean(errors.sku)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.sku && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.sku}</p>}
            </div>

            <div>
              <label htmlFor="field-stock" className="block text-sm font-medium text-secondary">
                Stock Quantity <span className="text-destructive">*</span>
              </label>
              <input
                id="field-stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                aria-invalid={Boolean(errors.stock)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
              {errors.stock && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.stock}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="field-description" className="block text-sm font-medium text-secondary">
                Description
              </label>
              <textarea
                id="field-description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="field-tags" className="block text-sm font-medium text-secondary">
                Tags <span className="text-muted-foreground">(comma-separated)</span>
              </label>
              <input
                id="field-tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="switch, gigabit, managed"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-secondary">
              Product Images <span className="text-destructive">*</span>
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
              <p className="text-sm text-muted-foreground">Drag & drop images here, or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-primary hover:bg-muted cursor-pointer"
              >
                Browse Files
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileInput} />
            </div>
            {errors.images && <p role="alert" className="mt-1.5 text-sm text-destructive">{errors.images}</p>}

            {(existingImages.length > 0 || newFiles.length > 0) && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                {existingImages.map((url) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {newFiles.map((f) => (
                  <div key={f.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(f.previewUrl)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold text-primary">Status</h2>
            <div className="mt-3 flex gap-2">
              {["active", "draft"].map((s) => (
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

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold text-primary">Merchandising</h2>
            <div className="mt-3 flex flex-col gap-3">
              {[
                { name: "featured", label: "Featured Product" },
                { name: "bestSeller", label: "Best Seller" },
                { name: "newArrival", label: "New Arrival" },
              ].map((opt) => (
                <label key={opt.name} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-secondary">
                  <input
                    type="checkbox"
                    name={opt.name}
                    checked={form[opt.name]}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  />
                  {opt.label}
                </label>
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
              onClick={() => navigate("/admin/products")}
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
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
