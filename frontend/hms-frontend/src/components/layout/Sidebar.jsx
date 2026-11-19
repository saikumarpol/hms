
import {
  Activity,
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardPlus,
  FlaskConical,
  UserCog,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAVIGATION = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        roles: ["super_admin", "receptionist", "doctor", "lab_technician"],
      },
    ],
  },
  {
    label: "HOSPITAL",
    items: [
      {
        name: "Patients",
        path: "/patients",
        icon: Users,
        roles: ["super_admin", "receptionist", "doctor"],
      },
      {
        name: "Doctors",
        path: "/doctors",
        icon: Stethoscope,
        roles: ["super_admin", "receptionist"],
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: CalendarDays,
        roles: ["super_admin", "receptionist", "doctor"],
      },
    ],
  },
  {
    label: "CLINICAL",
    items: [
      {
        name: "Consultations",
        path: "/consultations",
        icon: ClipboardPlus,
        roles: ["super_admin", "doctor"],
      },
      {
        name: "Laboratory",
        path: "/laboratory",
        icon: FlaskConical,
        roles: ["super_admin", "doctor", "lab_technician"],
      },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        name: "User Management",
        path: "/users",
        icon: UserCog,
        roles: ["super_admin"],
      },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const visibleNavigation = NAVIGATION
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles.includes(user?.role)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Activity size={23} />
        </div>

        <div>
          <strong>
            HMS<span className="brand-dot">.</span>
          </strong>
          <small>Hospital Management</small>
        </div>
      </div>

      <div className="sidebar-section-title">WORKSPACE</div>

      <nav className="sidebar-nav">
        {visibleNavigation.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-heading">{group.label}</p>

            {group.items.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{name}</span>

                {path === "/" && (
                  <ChevronRight size={15} className="nav-arrow" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-mini">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="profile-info">
            <strong>{user?.name || "Hospital User"}</strong>
            <small>
              {(user?.role || "staff").replaceAll("_", " ")}
            </small>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
