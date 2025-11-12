import { useEffect, useState } from "react";
import { fetchAdminUsers, toggleUserSuspend, type AdminUser } from "../api/admin";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";
import "./Page.css";

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadUsers = async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSuspendToggle = async (user: AdminUser) => {
    setProcessing(user.id);
    try {
      const updated = await toggleUserSuspend(user.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update user.";
      setError(msg);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="data-card">
        <header className="data-card__header">
          <p className="data-card__title">Users</p>
          <p className="data-card__count">{users.length} accounts</p>
        </header>
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <p className="table-primary">{user.name ?? "—"}</p>
                      <p className="table-secondary">{user.email}</p>
                    </td>
                    <td>
                      <StatusBadge label={user.role} />
                    </td>
                    <td>
                      <StatusBadge label={user.isSuspended ? "suspended" : "active"} />
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        className={user.isSuspended ? "button button--success" : "button button--danger"}
                        disabled={processing === user.id}
                        onClick={() => handleSuspendToggle(user)}
                      >
                        {user.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;
