
import { useEffect, useState } from "react";
import {
  Search,
  Stethoscope,
  Phone,
  Mail,
  RefreshCw,
  Plus,
  X,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./doctors.css";

const INITIAL_FORM = {
  userId: "",
  specialization: "",
  qualification: "",
  department: "",
  experience: "",
  consultationFee: "",
  registrationNumber: "",
};

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

export default function Doctors() {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const isSuperAdmin = user?.role === "super_admin";

  const fetchDoctors = async (query = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/doctors", {
        params: query ? { search: query } : {},
      });

      setDoctors(response.data?.data || []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleUsers = async () => {
    if (!isSuperAdmin) return;

    setUsersLoading(true);

    try {
      const response = await api.get("/users", {
        params: { role: "doctor", isActive: "true" },
      });

      const users = response.data?.data || [];

      const existingUserIds = new Set(
        doctors.map((doctor) => {
          const userId =
            typeof doctor.user === "object"
              ? doctor.user?._id
              : doctor.user;

          return String(userId);
        })
      );

      setEligibleUsers(
        users.filter(
          (item) => !existingUserIds.has(String(item._id))
        )
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (isSuperAdmin && !loading) {
      fetchEligibleUsers();
    }
  }, [isSuperAdmin, loading, doctors]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchDoctors(search.trim());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openForm = async () => {
    setError("");
    setSuccess("");
    setForm(INITIAL_FORM);
    setShowForm(true);

    await fetchEligibleUsers();
  };

  const handleCreateDoctor = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.userId) {
      setError("Please select a doctor account.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/doctors", {
        userId: form.userId,
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        department: form.department.trim(),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        registrationNumber: form.registrationNumber.trim(),
      });

      setSuccess("Doctor profile created successfully.");

      setForm(INITIAL_FORM);
      setShowForm(false);

      await fetchDoctors(search.trim());
    } catch (err) {
      setError(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar doctors-toolbar">
        <div>
          <h1>Doctors</h1>
          <p>Browse registered doctors and their professional details.</p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            className="doctor-add-btn"
            onClick={openForm}
          >
            <Plus size={18} />
            Add Doctor Profile
          </button>
        )}
      </div>

      {error && (
        <div className="doctor-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="doctor-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="panel">
        <form
          className="table-toolbar"
          onSubmit={handleSearch}
        >
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search specialization or department..."
            />
          </div>

          <button type="submit" className="secondary-btn">
            Search
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              setSearch("");
              fetchDoctors();
            }}
            title="Refresh doctors"
          >
            <RefreshCw size={17} />
          </button>

          <span className="result-count">
            {doctors.length} doctors
          </span>
        </form>

        {loading ? (
          <div className="empty-state">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <Stethoscope size={30} />
            <p>No doctor profiles found.</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <article className="doctor-card" key={doctor._id}>
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    <Stethoscope size={23} />
                  </div>

                  <span
                    className={`availability ${
                      doctor.isAvailable
                        ? "available"
                        : "unavailable"
                    }`}
                  >
                    {doctor.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <h3>{doctor.user?.name || "Doctor"}</h3>

                <p className="doctor-specialty">
                  {doctor.specialization}
                </p>

                <p className="doctor-qualification">
                  {doctor.qualification}
                </p>

                <div className="doctor-meta">
                  <span>Department</span>
                  <strong>{doctor.department}</strong>
                </div>

                <div className="doctor-meta">
                  <span>Experience</span>
                  <strong>{doctor.experience} years</strong>
                </div>

                <div className="doctor-meta">
                  <span>Consultation fee</span>
                  <strong>₹{doctor.consultationFee}</strong>
                </div>

                <div className="doctor-contact">
                  <span>
                    <Mail size={14} />
                    {doctor.user?.email || "—"}
                  </span>

                  <span>
                    <Phone size={14} />
                    {doctor.user?.phone || "—"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="doctor-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
          >
            <div className="doctor-modal-heading">
              <div>
                <span className="doctor-modal-eyebrow">
                  DOCTOR MANAGEMENT
                </span>
                <h2 id="doctor-modal-title">
                  Create Doctor Profile
                </h2>
                <p>
                  Connect an existing doctor login account with
                  professional details.
                </p>
              </div>

              <button
                type="button"
                className="doctor-close-btn"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor}>
              <div className="doctor-form-grid">
                <label className="doctor-field full">
                  <span>Select Doctor Account *</span>

                  <select
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    required
                    disabled={usersLoading || eligibleUsers.length === 0}
                  >
                    <option value="">
                      {usersLoading
                        ? "Loading doctor accounts..."
                        : eligibleUsers.length === 0
                          ? "No doctor accounts available"
                          : "Select a doctor"}
                    </option>

                    {eligibleUsers.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} — {item.email}
                      </option>
                    ))}
                  </select>

                  <small>
                    Only active doctor accounts without a profile
                    are displayed.
                  </small>
                </label>

                <label className="doctor-field">
                  <span>Specialization *</span>
                  <input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="doctor-field">
                  <span>Qualification *</span>
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="doctor-field">
                  <span>Department *</span>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="doctor-field">
                  <span>Experience (years) *</span>
                  <input
                    type="number"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    max="60"
                    step="1"
                    required
                  />
                </label>

                <label className="doctor-field">
                  <span>Consultation Fee (₹) *</span>
                  <input
                    type="number"
                    name="consultationFee"
                    value={form.consultationFee}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="0"
                    step="0.01"
                    required
                  />
                </label>

                <label className="doctor-field">
                  <span>Registration Number</span>
                  <input
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    placeholder="Medical registration number"
                    maxLength={50}
                  />
                </label>
              </div>

              {eligibleUsers.length === 0 && !usersLoading && (
                <div className="doctor-form-note">
                  <AlertCircle size={16} />
                  Create a doctor login account in User Management
                  before adding its professional profile.
                </div>
              )}

              <div className="doctor-form-actions">
                <button
                  type="button"
                  className="doctor-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-add-btn"
                  disabled={
                    submitting ||
                    usersLoading ||
                    eligibleUsers.length === 0
                  }
                >
                  <UserPlus size={17} />
                  {submitting
                    ? "Creating profile..."
                    : "Create Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
