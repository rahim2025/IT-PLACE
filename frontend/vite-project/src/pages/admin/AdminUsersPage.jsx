import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../utils/api";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api
      .get("/users")
      .then((data) => {
        setUsers(data.users);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const toggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    setUpdatingId(targetUser.id);
    setError("");
    try {
      const { user } = await api.patch(`/users/${targetUser.id}/role`, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update this user's role.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Promote a user to admin, or revoke admin access.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : status === "error" ? (
          <p className="px-6 py-20 text-center text-sm text-muted-foreground">Could not load users.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold text-primary">
                    {u.name}
                    {u.id === currentUser?.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleRole(u)}
                      disabled={updatingId === u.id || (u.id === currentUser?.id && u.role === "admin")}
                      title={u.id === currentUser?.id && u.role === "admin" ? "You cannot remove your own admin access" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        u.role === "admin"
                          ? "border-border text-secondary hover:bg-muted"
                          : "border-accent/30 text-accent hover:bg-accent/10"
                      }`}
                    >
                      {updatingId === u.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : u.role === "admin" ? (
                        <ShieldOff size={13} />
                      ) : (
                        <ShieldCheck size={13} />
                      )}
                      {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
