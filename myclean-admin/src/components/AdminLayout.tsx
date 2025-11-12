import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./AdminLayout.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/services", label: "Service Approvals", icon: "🧼" },
  { to: "/data", label: "Data Explorer", icon: "📚" },
];

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">🧼</span>
          <div>
            <p className="sidebar__title">MyClean</p>
            <p className="sidebar__subtitle">Admin</p>
          </div>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <p className="topbar__path">{location.pathname}</p>
            <p className="topbar__title">Admin Dashboard</p>
          </div>
          <div className="topbar__user">
            <div>
              <p className="topbar__user-name">{user?.name ?? "Admin"}</p>
              <p className="topbar__user-email">{user?.email}</p>
            </div>
            <button onClick={logout} className="button button--ghost">
              Logout
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
