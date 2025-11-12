import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { fetchProviders } from "../api/admin";
import type { ProviderRecord } from "../api/admin";
import { formatDate } from "../utils/format";
import "./Page.css";

const ProvidersPage = () => {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProviders = async () => {
      try {
        setLoading(true);
        const data = await fetchProviders();
        if (isMounted) {
          setProviders(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load providers.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadProviders();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading providers…</p>
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
        title="Provider profiles"
        data={providers}
        columns={[
          {
            header: "Provider",
            render: (provider) => (
              <div>
                <p className="table-primary">{provider.name}</p>
                <p className="table-secondary">{provider.email}</p>
              </div>
            ),
          },
          {
            header: "Location",
            render: (provider) => (
              <span>{provider.city ? `${provider.city}, ${provider.state ?? ""}` : "Not set"}</span>
            ),
          },
          {
            header: "Profile",
            render: (provider) => (
              <div>
                <StatusBadge label={provider.isVerified ? "verified" : "pending"} />
                <StatusBadge label={provider.isProfileComplete ? "complete" : "incomplete"} />
              </div>
            ),
          },
          {
            header: "Bookings",
            render: (provider) => (
              <div>
                <p className="table-primary">{provider.totalBookings.toLocaleString()}</p>
                <p className="table-secondary">{provider.averageRating.toFixed(1)} ★ rating</p>
              </div>
            ),
          },
          {
            header: "Joined",
            render: (provider) => formatDate(provider.createdAt),
          },
        ]}
      />
    </div>
  );
};

export default ProvidersPage;
