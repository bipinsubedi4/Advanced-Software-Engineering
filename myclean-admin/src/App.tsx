import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ServiceApprovals from "./pages/ServiceApprovals";
import UserManagement from "./pages/UserManagement";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import RequireAdmin from "./components/RequireAdmin";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/services" element={<ServiceApprovals />} />
        <Route path="/data" element={<UserManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
