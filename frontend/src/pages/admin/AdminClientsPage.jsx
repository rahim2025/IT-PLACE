import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminClientsPage() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("loading");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = () => {
    setStatus("loading");
    api
      .get("/clients")
      .then((data) => {
        setClients(data.clients);
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
      await api.delete(`/clients/${deleteTarget.id}`);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not delete this client.";
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
          <h1 className="text-2xl font-extrabold text-primary">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clients.length} clients shown on the homepage</p>
        </div>
        <Link
          to="/admin/clients/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
        >
          <Plus size={16} />
          Add Client
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : status === "error" ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">Could not load clients.</p>
        ) : clients.length === 0 ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Work</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-secondary">{c.location}</td>
                  <td className="max-w-[280px] px-4 py-3 text-secondary">
                    <p className="truncate">{c.work}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary">{c.order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/clients/${c.id}/edit`}
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
                          setDeleteTarget(c);
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this client?"
        description={deleteError || (deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.` : "")}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
