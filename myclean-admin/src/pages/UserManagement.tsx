import { useEffect, useState } from "react";
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
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import "./Page.css";

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProviderProfile[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

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

      <section className="data-card">
        <header className="data-card__header">
          <p className="data-card__title">Cleaner profiles</p>
          <p className="data-card__count">{profiles.length} profiles</p>
        </header>
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cleaner</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="data-table__empty">
                    No profiles found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <p className="table-primary">{profile.user.name ?? "—"}</p>
                      <p className="table-secondary">Profile #{profile.id}</p>
                    </td>
                    <td>
                      <p className="table-secondary">{profile.user.email}</p>
                      {profile.user.phone && <p className="table-secondary">{profile.user.phone}</p>}
                    </td>
                    <td>
                      {profile.city ? `${profile.city}, ${profile.state ?? ""}` : "Not set"}
                      <p className="table-secondary">Radius: {profile.serviceRadius ?? 0} mi</p>
                    </td>
                    <td>
                      {profile.services.length === 0 ? (
                        <span className="table-secondary">No services</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.services.map((service) => (
                            <StatusBadge key={service.id} label={`${service.status} • ${service.serviceName}`} />
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-card">
        <header className="data-card__header">
          <p className="data-card__title">Recent bookings</p>
          <p className="data-card__count">{bookings.length} records</p>
        </header>
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Cleaner</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table__empty">
                    No bookings available.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <p className="table-primary">#{booking.id}</p>
                      <StatusBadge label={booking.status} />
                    </td>
                    <td>
                      <p className="table-primary">{booking.service.serviceName}</p>
                      <StatusBadge label={booking.service.status} />
                    </td>
                    <td>
                      <p className="table-primary">{booking.customer.name ?? "—"}</p>
                      <p className="table-secondary">{booking.customer.email}</p>
                    </td>
                    <td>
                      <p className="table-primary">{booking.provider.name ?? "—"}</p>
                      <p className="table-secondary">{booking.provider.email}</p>
                    </td>
                    <td>
                      <p className="table-primary">{formatCurrency(booking.totalPrice)}</p>
                      <p className="table-secondary">{booking.paymentStatus}</p>
                    </td>
                    <td>{formatDateTime(booking.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-card">
        <header className="data-card__header">
          <p className="data-card__title">Reviews</p>
          <p className="data-card__count">{reviews.length} submissions</p>
        </header>
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rating</th>
                <th>Comment</th>
                <th>Service</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="data-table__empty">
                    No reviews yet.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <p className="table-primary">{review.rating} ★</p>
                      <p className="table-secondary">{review.customer.name ?? review.customer.email}</p>
                    </td>
                    <td>{review.comment ?? "—"}</td>
                    <td>{review.booking.service?.serviceName ?? "—"}</td>
                    <td>{formatDate(review.createdAt)}</td>
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
