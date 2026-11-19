
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import { createUser, getUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

import "./user-management.css";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "receptionist", label: "Receptionist" },
  { value: "doctor", label: "Doctor" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "accountant", label: "Accountant" },
];

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  receptionist: "Receptionist",
  doctor: "Doctor",
  lab_technician: "Lab Technician",
  pharmacist: "Pharmacist",
  accountant: "Accountant",
  patient: "Patient",
};

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "receptionist",
};

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UserManagement() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const isSuperAdmin = user?.role === "super_admin";

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin, loadUsers]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });

      setSuccess("Staff account created successfully.");
      setForm(INITIAL_FORM);
      setShowForm(false);

      await loadUsers();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query) ||
        (item.phone || "").toLowerCase().includes(query);

      const matchesRole =
        !roleFilter || item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const activeCount = users.filter((item) => item.isActive).length;

  const staffCount = users.filter(
    (item) => item.role !== "super_admin"
  ).length;

  if (!isSuperAdmin) {
    return (
      <div className="um-page">
        <div className="um-alert error">
          <ShieldCheck size={20} />
          Only Super Admin can access User Management.
        </div>
      </div>
    );
  }

  return (
    <div className="um-page">
      <div className="um-heading">
        <div>
          <span className="um-eyebrow">HOSPITAL ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>Create and manage hospital staff accounts.</p>
        </div>

        <button
          className="um-primary-btn"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          type="button"
        >
          <UserPlus size={18} />
          Add Staff Member
        </button>
      </div>

      {error && (
        <div className="um-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="um-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total accounts</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon green">
            <UserCheck size={21} />
          </div>
          <div>
            <span>Active accounts</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon amber">
            <ShieldCheck size={21} />
          </div>
          <div>
            <span>Staff accounts</span>
            <strong>{staffCount}</strong>
          </div>
        </div>
      </div>

      <section className="um-panel">
        <div className="um-panel-heading">
          <div>
            <h2>Staff directory</h2>
            <p>All registered hospital accounts.</p>
          </div>

          <button
            type="button"
            className="um-refresh-btn"
            onClick={loadUsers}
            disabled={loading}
            title="Refresh staff"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="um-filters">
          <div className="um-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="um-role-filter"
          >
            <option value="">All roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="um-table-wrap">
          {loading ? (
            <div className="um-empty">
              <RefreshCw className="um-spin" size={25} />
              <p>Loading staff accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="um-empty">
              <Users size={34} />
              <h3>No staff accounts found</h3>
              <p>Create your first staff account to get started.</p>
            </div>
          ) : (
            <table className="um-table">
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item._id || item.id}>
                    <td>
                      <div className="um-user-name">
                        <div className="um-avatar">
                          {item.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <strong>{item.name}</strong>
                      </div>
                    </td>

                    <td>{item.email}</td>
                    <td>{item.phone || "—"}</td>

                    <td>
                      <span className="um-role-badge">
                        {ROLE_LABELS[item.role] || item.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`um-status ${
                          item.isActive ? "active" : "inactive"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && (
          <div className="um-footer">
            Showing {filteredUsers.length} account(s)
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="um-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="um-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="um-modal-title"
          >
            <div className="um-modal-heading">
              <div>
                <h2 id="um-modal-title">Add Staff Member</h2>
                <p>Create a new hospital login account.</p>
              </div>

              <button
                type="button"
                className="um-close-btn"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="um-form-grid">
                <label className="um-field full">
                  <span>Full name *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="um-field">
                  <span>Email address *</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="staff@hospital.com"
                    required
                  />
                </label>

                <label className="um-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </label>

                <label className="um-field full">
                  <span>Role *</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="um-field full">
                  <span>Password *</span>
                  <div className="um-password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <div className="um-form-note">
                <ShieldCheck size={16} />
                The new staff member can use this email and password to log in.
              </div>

              <div className="um-form-actions">
                <button
                  type="button"
                  className="um-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="um-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
