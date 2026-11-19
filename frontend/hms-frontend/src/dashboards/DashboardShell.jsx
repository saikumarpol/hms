
import { Activity, ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardShell({
  title,
  subtitle,
  greeting,
  user,
  stats = [],
  actions = [],
  children,
}) {
  return (
    <div className="page-stack">
      <section className="welcome-banner">
        <div>
          <span className="banner-label">{title.toUpperCase()}</span>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "User"}.</h1>
          <p>{subtitle}</p>
        </div>

        <div className="banner-art">
          <Activity size={76} strokeWidth={1.2} />
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h3>{greeting}</h3>
          <p>Your personal hospital workspace</p>
        </div>

        <span className="live-indicator">
          <i />
          {user?.role?.replaceAll("_", " ")}
        </span>
      </div>

      {stats.length > 0 && (
        <section className="stats-grid">
          {stats.map(({ title, value, icon: Icon, color, note }) => (
            <div className="stat-card" key={title}>
              <div className="stat-top">
                <div className={`stat-icon ${color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="stat-title">{title}</p>
              <h2>{value}</h2>
              <p className="stat-note">{note}</p>
            </div>
          ))}
        </section>
      )}

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Quick actions</h3>
              <p>Available tasks for your role</p>
            </div>
          </div>

          <div className="quick-actions">
            {actions.map(({ title, description, path, icon: Icon, color }) => (
              <Link to={path} className="quick-action" key={path}>
                <div className={`quick-icon ${color}`}>
                  <Icon size={20} />
                </div>

                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>

                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>My account</h3>
              <p>Logged-in account information</p>
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <strong>{user?.name || "Hospital User"}</strong>
            <p className="stat-note">{user?.email || ""}</p>

            <div style={{ marginTop: 20 }}>
              <span className="stat-note">Assigned role</span>
              <p style={{ fontWeight: 600, textTransform: "capitalize" }}>
                {user?.role?.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {children}

      <div className="footer-note">
        <Clock3 size={15} />
        HMS workspace · Role-based access enabled
      </div>
    </div>
  );
}
