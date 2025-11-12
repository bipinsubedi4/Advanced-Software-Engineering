import "./StatusBadge.css";

const statusColors: Record<string, string> = {
  PENDING: "badge--warning",
  ACCEPTED: "badge--info",
  COMPLETED: "badge--success",
  CANCELLED: "badge--danger",
  DECLINED: "badge--danger",
  PAID: "badge--success",
  REFUNDED: "badge--muted",
  ACTIVE: "badge--info",
};

const StatusBadge = ({ label }: { label: string }) => {
  const normalized = label.toUpperCase();
  const colorClass = statusColors[normalized] ?? "badge--muted";
  return <span className={`badge ${colorClass}`}>{normalized}</span>;
};

export default StatusBadge;
