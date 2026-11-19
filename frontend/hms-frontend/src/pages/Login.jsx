
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@hms.local");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to login. Please try again."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-mark"><Activity size={27} /></div>
        <span>HMS<span className="brand-dot">.</span></span>
      </div>

      <div className="login-card">
        <div className="login-icon"><Activity size={25} /></div>
        <p className="eyebrow">HOSPITAL MANAGEMENT SYSTEM</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to access your hospital workspace.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email address</label>
          <div className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <label>Password</label>
          <div className="input-wrap">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="primary-btn login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to workspace"}
          </button>
        </form>

        <p className="login-footer">
          Secure access · Authorized hospital personnel only
        </p>
      </div>

      <p className="login-copyright">© {new Date().getFullYear()} HMS · Hospital Management System</p>
    </div>
  );
}
