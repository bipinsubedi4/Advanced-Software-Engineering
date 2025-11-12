import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { fetchUsers } from "../api/admin";
import type { UserRecord } from "../api/admin";
import { formatDate } from "../utils/format";
import "./Page.css";

const UsersPage = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

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
      <DataTable
        title="Recent users"
        data={users}
        columns={[
          {
            header: "User",
            render: (user) => (
              <div>
                <p className="table-primary">{user.name ?? "—"}</p>
                <p className="table-secondary">{user.email}</p>
              </div>
            ),
          },
          {
            header: "Role",
            render: (user) => <StatusBadge label={user.role} />,
          },
          {
            header: "Joined",
            render: (user) => formatDate(user.createdAt),
          },
        ]}
      />
    </div>
  );
};

export default UsersPage;
