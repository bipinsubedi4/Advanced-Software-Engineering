import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { fetchRecentBookings } from "../api/admin";
import type { BookingSummary } from "../api/admin";
import { formatCurrency, formatDateTime } from "../utils/format";
import "./Page.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentBookings();
        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load bookings.");
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

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading bookings…</p>
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
        title="Recent bookings"
        data={bookings}
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
            render: (booking) => formatDateTime(booking.createdAt),
          },
        ]}
      />
    </div>
  );
};

export default BookingsPage;
