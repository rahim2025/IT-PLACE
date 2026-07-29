import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../ConfirmDialog";
import TaxonomyFormModal from "./TaxonomyFormModal";

export default function AdminTaxonomyPage({ apiPath, plural, label, imageField = "image" }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [modal, setModal] = useState(null); // { mode: "add" | "edit" | "view", item }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = () => {
    setStatus("loading");
    api
      .get(apiPath)
      .then((data) => {
        setItems(data[plural]);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [apiPath, plural]);

  const handleSubmit = async (payload) => {
    if (modal.mode === "add") {
      const data = await api.post(apiPath, payload);
      setItems((prev) => [...prev, data[label]].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${capitalize(label)} "${payload.name}" was created.`);
    } else {
      const data = await api.put(`${apiPath}/${modal.item.id}`, payload);
      setItems((prev) => prev.map((it) => (it.id === data[label].id ? data[label] : it)));
      toast.success(`${capitalize(label)} "${payload.name}" was updated.`);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`${apiPath}/${deleteTarget.id}`);
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      toast.success(`${capitalize(label)} "${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : `Could not delete this ${label}.`;
      setDeleteError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary capitalize">{plural}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} {plural}</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
        >
          <Plus size={16} />
          Add {capitalize(label)}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : status === "error" ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">Could not load {plural}.</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">No {plural} yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">{capitalize(label)} Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3"># Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold text-primary">{item.name}</td>
                  <td className="px-4 py-3 text-secondary">{item.slug}</td>
                  <td className="px-4 py-3 text-secondary">{item.productCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="View"
                        onClick={() => setModal({ mode: "view", item })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-muted cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => setModal({ mode: "edit", item })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-accent hover:bg-accent/10 cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteTarget(item);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TaxonomyFormModal
        open={Boolean(modal)}
        mode={modal?.mode}
        label={capitalize(label)}
        imageField={imageField}
        initial={modal?.item}
        onSubmit={handleSubmit}
        onClose={() => setModal(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Are you sure you want to delete this ${label}?`}
        description={deleteError || (deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.` : "")}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
