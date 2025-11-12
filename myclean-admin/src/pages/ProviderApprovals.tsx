import { useEffect, useState } from "react";
import {
  approveProvider,
  fetchPendingProviders,
  rejectProvider,
  type PendingProvider,
} from "../api/admin";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";
import "./Page.css";

const ProviderApprovals = () => {
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadProviders = async () => {
    try {
      const data = await fetchPendingProviders();
      setProviders(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch providers.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleDecision = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      if (action === "approve") {
        await approveProvider(id);
      } else {
        await rejectProvider(id);
      }
      await loadProviders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update provider.";
      setError(msg);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading pending providers…</p>
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
          <p className="data-card__title">Pending provider approvals</p>
          <p className="data-card__count">{providers.length} awaiting review</p>
        </header>
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Location</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    No pending providers.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.id}>
                    <td>
                      <p className="table-primary">{provider.name}</p>
                      <p className="table-secondary">{provider.email}</p>
                    </td>
                    <td>
                      {provider.city ? `${provider.city}, ${provider.state ?? ""}` : "Not provided"}
                    </td>
                    <td>
                      <StatusBadge label={provider.verificationStatus ?? "pending"} />
                    </td>
                    <td>{formatDate(provider.createdAt)}</td>
                    <td>
                      <div className="button-group">
                        <button
                          className="button button--success"
                          disabled={actionId === provider.id}
                          onClick={() => handleDecision(provider.id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="button button--danger"
                          disabled={actionId === provider.id}
                          onClick={() => handleDecision(provider.id, "reject")}
                        >
                          Reject
                        </button>
                      </div>
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

export default ProviderApprovals;
