import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { getServiceIcon } from "../../data/serviceIcons";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminServicesPage() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = () => {
    setStatus("loading");
    api
      .get("/services")
      .then((data) => {
        setServices(data.services);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/services/${deleteTarget.id}`);
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.title}" was deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not delete this service.";
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
          <h1 className="text-2xl font-extrabold text-primary">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">{services.length} services shown on the homepage carousel</p>
        </div>
        <Link
          to="/admin/services/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
        >
          <Plus size={16} />
          Add Service
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : status === "error" ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">Could not load services.</p>
        ) : services.length === 0 ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">No services yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const Icon = getServiceIcon(s.icon);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <img src={s.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate font-semibold text-primary">{s.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.summary}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon size={16} />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">{s.order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          s.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/services/${s.id}/edit`}
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-accent hover:bg-accent/10 cursor-pointer"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(s);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this service?"
        description={deleteError || (deleteTarget ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.` : "")}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
