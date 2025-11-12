import { useEffect, useMemo, useState } from "react";
import { approveService, fetchServices, rejectService, type ServiceRecord } from "../api/admin";
import StatusBadge from "../components/StatusBadge";
import DataTable, { type Column } from "../components/DataTable";
import { formatCurrency, formatDateTime } from "../utils/format";
import "./Page.css";

const filters = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

const ServiceApprovals = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterValue>("PENDING");

  const loadServices = async (status: FilterValue) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices(status === "ALL" ? undefined : status);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(filter);
  }, [filter]);

  const handleDecision = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      if (action === "approve") {
        await approveService(id);
      } else {
        const reason = window.prompt("Provide a rejection reason (optional)") ?? "";
        await rejectService(id, reason.trim() || undefined);
      }
      await loadServices(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service status.");
    } finally {
      setActionId(null);
    }
  };

  const columns = useMemo<Column<ServiceRecord>[]>(
    () => [
      {
        header: "Service",
        render: (service) => (
          <div>
            <p className="table-primary">{service.serviceName}</p>
            {service.description && <p className="table-secondary">{service.description}</p>}
          </div>
        ),
      },
      {
        header: "Cleaner",
        render: (service) => (
          <div>
            <p className="table-primary">{service.provider.name}</p>
            <p className="table-secondary">{service.provider.email}</p>
          </div>
        ),
      },
      {
        header: "Pricing",
        render: (service) => (
          <div>
            <p className="table-primary">{formatCurrency(service.pricePerHour)}</p>
            <p className="table-secondary">{service.durationMin} min</p>
          </div>
        ),
      },
      {
        header: "Status",
        render: (service) => (
          <div>
            <StatusBadge label={service.status} />
            {service.rejectionReason && service.status === "REJECTED" && (
              <p className="table-secondary">Reason: {service.rejectionReason}</p>
            )}
          </div>
        ),
      },
      {
        header: "Submitted",
        render: (service) => formatDateTime(service.createdAt),
      },
      {
        header: "Actions",
        minWidth: "200px",
        render: (service) =>
          service.status === "PENDING" ? (
            <div className="button-group">
              <button
                className="button button--success"
                disabled={actionId === service.id}
                onClick={() => handleDecision(service.id, "approve")}
              >
                Approve
              </button>
              <button
                className="button button--danger"
                disabled={actionId === service.id}
                onClick={() => handleDecision(service.id, "reject")}
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No action required</span>
          ),
      },
    ],
    [actionId]
  );

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading services…</p>
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
      <div className="button-group mb-4">
        {filters.map((item) => (
          <button
            key={item.value}
            className={`button ${filter === item.value ? "button--ghost" : ""}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <DataTable title="Cleaning services" columns={columns} data={services} emptyMessage="No services found." />
    </div>
  );
};

export default ServiceApprovals;
