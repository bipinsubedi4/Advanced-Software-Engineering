import { useEffect, useState } from "react";
import { fetchStats } from "../api/admin";
import { formatCurrency } from "../utils/format";
import "./Page.css";

const Dashboard = () => {
  const [stats, setStats] = useState<{ users: number; bookings: number; revenue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchStats();
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load stats.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading admin stats…</p>
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

  if (!stats) {
    return null;
  }

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">Users</p>
          <p className="stat-card__value">{stats.users.toLocaleString()}</p>
          <p className="stat-card__helper">Total accounts in the system</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Bookings</p>
          <p className="stat-card__value">{stats.bookings.toLocaleString()}</p>
          <p className="stat-card__helper">All-time cleaning jobs</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Revenue</p>
          <p className="stat-card__value">{formatCurrency(stats.revenue)}</p>
          <p className="stat-card__helper">Completed booking revenue</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
