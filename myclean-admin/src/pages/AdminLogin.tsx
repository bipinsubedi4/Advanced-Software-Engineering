import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { getApiBaseUrl } from "../api/client";
import "./Login.css";

const AdminLogin = () => {
  const { login, error, clearError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    setLoading(true);

    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: Location })?.from ?? { pathname: "/" };
      navigate(redirectTo, { replace: true });
    } catch {
      // errors handled centrally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card__header">
          <span className="login-card__logo">🧼</span>
          <div>
            <p className="login-card__title">MyClean Admin</p>
            <p className="login-card__subtitle">Restricted Area</p>
          </div>
        </div>
        <div className="login-card__env">
          <small>API: {getApiBaseUrl()}</small>
        </div>
        {error && <div className="login-card__error">{error}</div>}

        <label className="login-card__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@myclean.app"
            required
          />
        </label>

        <label className="login-card__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button className="login-card__button" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
