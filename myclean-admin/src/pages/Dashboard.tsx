import { useEffect, useMemo, useState } from "react";
import StatsGrid from "../components/StatsGrid";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { fetchOverview, fetchRecentBookings } from "../api/admin";
import type { BookingSummary, OverviewResponse } from "../api/admin";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import "./Page.css";

const DashboardPage = () => {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [overviewResponse, bookingsResponse] = await Promise.all([fetchOverview(), fetchRecentBookings()]);
        if (!isMounted) return;
        setOverview(overviewResponse);
        setBookings(bookingsResponse);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      {
        label: "Total users",
        value: overview.totalUsers.toLocaleString(),
        helper: `${overview.totalCustomers.toLocaleString()} customers · ${overview.totalProviders.toLocaleString()} providers`,
      },
      {
        label: "Bookings",
        value: overview.totalBookings.toLocaleString(),
        helper: `${overview.activeBookings.toLocaleString()} active right now`,
      },
      {
        label: "Monthly revenue",
        value: formatCurrency(overview.monthlyRevenue),
        helper: `Avg booking ${formatCurrency(overview.averageBookingValue)}`,
      },
      {
        label: "Status mix",
        value: overview.bookingsByStatus.find((item) => item.status === "COMPLETED")?.count?.toString() ?? "—",
        helper: "Completed bookings",
      },
    ];
  }, [overview]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading admin insights…</p>
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

  if (!overview) {
    return (
      <div className="page-error">
        <p>Overview data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <StatsGrid stats={stats} />

      <section className="grid-2">
        <div className="panel">
          <p className="panel__title">Latest providers</p>
          <ul className="list">
            {overview.recentProviders.map((provider) => (
              <li key={provider.id}>
                <div>
                  <p className="list__title">{provider.name}</p>
                  <p className="list__subtitle">
                    {provider.city ? `${provider.city}, ${provider.state}` : "Location not set"}
                  </p>
                </div>
                <StatusBadge label={provider.isVerified ? "verified" : "pending"} />
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <p className="panel__title">New customers</p>
          <ul className="list">
            {overview.recentCustomers.map((customer) => (
              <li key={customer.id}>
                <div>
                  <p className="list__title">{customer.name ?? customer.email}</p>
                  <p className="list__subtitle">{customer.email}</p>
                </div>
                <span className="list__date">{formatDate(customer.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DataTable
        title="Recent bookings"
        data={bookings}
        emptyMessage="No bookings recorded yet."
        columns={[
          {
            header: "Booking",
            render: (booking) => (
              <div>
                <p className="table-primary">{booking.serviceName}</p>
                <p className="table-secondary">#{booking.id}</p>
              </div>
            ),
          },
          {
            header: "Customer",
            render: (booking) => (
              <div>
                <p className="table-primary">{booking.customer.name ?? "Customer"}</p>
                <p className="table-secondary">{booking.customer.email}</p>
              </div>
            ),
          },
          {
            header: "Provider",
            render: (booking) => (
              <div>
                <p className="table-primary">{booking.provider.name ?? "Provider"}</p>
                <p className="table-secondary">{booking.provider.email}</p>
              </div>
            ),
          },
          {
            header: "Status",
            render: (booking) => <StatusBadge label={booking.status} />,
          },
          {
            header: "Payment",
            render: (booking) => (
              <div>
                <p className="table-primary">{formatCurrency(booking.totalPrice)}</p>
                <StatusBadge label={booking.paymentStatus} />
              </div>
            ),
          },
          {
            header: "Created",
            render: (booking) => <span>{formatDateTime(booking.createdAt)}</span>,
          },
        ]}
      />
    </div>
  );
};

export default DashboardPage;
