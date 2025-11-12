import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import ProvidersPage from "./pages/Providers";
import BookingsPage from "./pages/Bookings";
import LoginPage from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import { useAdminAuth } from "./context/AdminAuthContext";

const ProtectedOutlet = () => {
  const { token, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-center">
        <p>Checking session…</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedOutlet />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
