import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminBookings,
  fetchAdminReviews,
  fetchAdminUsers,
  fetchProviderProfiles,
  toggleUserSuspend,
  type AdminBooking,
  type AdminProviderProfile,
  type AdminReview,
  type AdminUser,
} from "../api/admin";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import StatsGrid from "../components/StatsGrid";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import "./Page.css";

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProviderProfile[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, profileData, bookingData, reviewData] = await Promise.all([
        fetchAdminUsers(),
        fetchProviderProfiles(),
        fetchAdminBookings(),
        fetchAdminReviews(),
      ]);
      setUsers(userData);
      setProfiles(profileData);
      setBookings(bookingData);
      setReviews(reviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSuspendToggle = async (user: AdminUser) => {
    setProcessingId(user.id);
    try {
      const updated = await toggleUserSuspend(user.id);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user." );
    } finally {
      setProcessingId(null);
    }
  };

  const stats = [
    { label: "Users", value: users.length.toLocaleString(), helper: "All roles" },
    { label: "Cleaner profiles", value: profiles.length.toLocaleString(), helper: "Active + draft" },
    { label: "Bookings", value: bookings.length.toLocaleString(), helper: "Recent records" },
    { label: "Reviews", value: reviews.length.toLocaleString(), helper: "Latest submissions" },
  ];

  const userColumns = useMemo<Column<AdminUser>[]>(
    () => [
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
        header: "Status",
        render: (user) => <StatusBadge label={user.isSuspended ? "suspended" : "active"} />,
      },
      {
        header: "Joined",
        render: (user) => formatDate(user.createdAt),
      },
      {
        header: "Actions",
        render: (user) => (
          <button
            className={user.isSuspended ? "button button--success" : "button button--danger"}
            disabled={processingId === user.id}
            onClick={() => handleSuspendToggle(user)}
          >
            {user.isSuspended ? "Unsuspend" : "Suspend"}
          </button>
        ),
      },
    ],
    [processingId]
  );

  const profileColumns = useMemo<Column<AdminProviderProfile>[]>(
    () => [
      {
        header: "Cleaner",
        render: (profile) => (
          <div>
            <p className="table-primary">{profile.user.name ?? "—"}</p>
            <p className="table-secondary">{profile.user.email}</p>
          </div>
        ),
      },
      {
        header: "Contact",
        render: (profile) => profile.user.phone ?? "—",
      },
      {
        header: "Service Areas",
        render: (profile) =>
          profile.servicePostcodes && profile.servicePostcodes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {profile.servicePostcodes.map((postcode) => (
                <span key={postcode} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                  {postcode}
                </span>
              ))}
            </div>
          ) : (
            <span className="table-secondary">Not set</span>
          ),
      },
      {
        header: "Services",
        render: (profile) =>
          profile.services.length === 0 ? (
            <span className="table-secondary">No services</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {profile.services.map((service) => (
                <StatusBadge key={service.id} label={`${service.status} • ${service.serviceName}`} />
              ))}
            </div>
          ),
      },
    ],
    []
  );

  const bookingColumns = useMemo<Column<AdminBooking>[]>(
    () => [
      {
        header: "Booking",
        render: (booking) => (
          <div>
            <p className="table-primary">#{booking.id}</p>
            <StatusBadge label={booking.status} />
          </div>
        ),
      },
      {
        header: "Service",
        render: (booking) => (
          <div>
            <p className="table-primary">{booking.service.serviceName}</p>
            <StatusBadge label={booking.service.status} />
          </div>
        ),
      },
      {
        header: "Customer",
        render: (booking) => (
          <div>
            <p className="table-primary">{booking.customer.name ?? "—"}</p>
            <p className="table-secondary">{booking.customer.email}</p>
          </div>
        ),
      },
      {
        header: "Cleaner",
        render: (booking) => (
          <div>
            <p className="table-primary">{booking.provider.name ?? "—"}</p>
            <p className="table-secondary">{booking.provider.email}</p>
          </div>
        ),
      },
      {
        header: "Total",
        render: (booking) => <p className="table-primary">{formatCurrency(booking.totalPrice)}</p>,
      },
      {
        header: "Payment",
        render: (booking) => <StatusBadge label={booking.paymentStatus} />,
      },
      {
        header: "Created",
        render: (booking) => formatDateTime(booking.createdAt),
      },
    ],
    []
  );

  const reviewColumns = useMemo<Column<AdminReview>[]>(
    () => [
      {
        header: "Rating",
        render: (review) => (
          <div>
            <p className="table-primary">{review.rating} ★</p>
            <p className="table-secondary">{review.customer.name ?? review.customer.email}</p>
          </div>
        ),
      },
      {
        header: "Comment",
        render: (review) => review.comment ?? "—",
      },
      {
        header: "Service",
        render: (review) => review.booking.service?.serviceName ?? "—",
      },
      {
        header: "Submitted",
        render: (review) => formatDate(review.createdAt),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading admin data…</p>
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
      <StatsGrid stats={stats.map((stat) => ({ label: stat.label, value: stat.value, helper: stat.helper }))} />
      <DataTable title="Users" columns={userColumns} data={users} emptyMessage="No users found." />
      <DataTable
        title="Cleaner profiles"
        columns={profileColumns}
        data={profiles}
        emptyMessage="No cleaner profiles yet."
      />
      <DataTable
        title="Recent bookings"
        columns={bookingColumns}
        data={bookings}
        emptyMessage="No bookings available."
      />
      <DataTable title="Latest reviews" columns={reviewColumns} data={reviews} emptyMessage="No reviews yet." />
    </div>
  );
};

export default UserManagement;
