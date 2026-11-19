
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardPlus,
  Search,
  RefreshCw,
  UserRound,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Eye,
} from "lucide-react";

import { getConsultations } from "../services/consultationService";
import "./consultations.css";

const getError = (error) =>
  error.response?.data?.message || "Unable to load consultations.";

const patientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
  "Unknown patient";

const doctorName = (doctor) => doctor?.user?.name || "Unknown doctor";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const STATUS_LABELS = {
  in_progress: "In Progress",
  completed: "Completed",
};

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (status) filters.status = status;

      const data = await getConsultations(filters);
      setConsultations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = consultations.filter((item) => {
    const patient = patientName(item.patient).toLowerCase();
    const doctor = doctorName(item.doctor).toLowerCase();

    return (
      patient.includes(normalizedSearch) ||
      doctor.includes(normalizedSearch) ||
      (item.consultationNumber || "").toLowerCase().includes(normalizedSearch) ||
      (item.patient?.uhid || "").toLowerCase().includes(normalizedSearch) ||
      (item.appointment?.appointmentNumber || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const inProgress = consultations.filter(
    (item) => item.status === "in_progress"
  ).length;

  const completed = consultations.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="consultations-page">
      <div className="consultations-heading">
        <div>
          <span className="eyebrow">CLINICAL OPERATIONS</span>
          <h1>Consultations</h1>
          <p>Review patient consultations, diagnosis and treatment records.</p>
        </div>

        <Link to="/consultations/new" className="consultation-primary-btn">
          <ClipboardPlus size={18} />
          Start consultation
        </Link>
      </div>

      <div className="consultation-stats">
        <div className="consultation-stat-card">
          <div className="consultation-stat-icon blue">
            <ClipboardPlus size={20} />
          </div>
          <div>
            <span>Total consultations</span>
            <strong>{consultations.length}</strong>
          </div>
        </div>

        <div className="consultation-stat-card">
          <div className="consultation-stat-icon amber">
            <Clock3 size={20} />
          </div>
          <div>
            <span>In progress</span>
            <strong>{inProgress}</strong>
          </div>
        </div>

        <div className="consultation-stat-card">
          <div className="consultation-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
        </div>

        <div className="consultation-stat-card">
          <div className="consultation-stat-icon violet">
            <UserRound size={20} />
          </div>
          <div>
            <span>Patients seen</span>
            <strong>
              {new Set(consultations.map((item) => item.patient?._id)).size}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="consultation-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <section className="consultation-panel">
        <div className="consultation-panel-heading">
          <div>
            <h2>Consultation records</h2>
            <p>Search and review clinical records.</p>
          </div>

          <button
            type="button"
            className="consultation-icon-button"
            onClick={loadConsultations}
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="consultation-filters">
          <div className="consultation-search">
            <Search size={17} />
            <input
              placeholder="Search patient, UHID or consultation number..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="consultation-filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="consultation-table-wrap">
          {loading ? (
            <div className="consultation-empty">
              <RefreshCw className="spin" size={24} />
              <p>Loading consultations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="consultation-empty">
              <ClipboardPlus size={34} />
              <h3>No consultations found</h3>
              <p>Start a consultation from a checked-in appointment.</p>
              <Link to="/consultations/new" className="consultation-text-link">
                Start consultation
              </Link>
            </div>
          ) : (
            <table className="consultation-table">
              <thead>
                <tr>
                  <th>Consultation</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Appointment</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="consultation-number">
                        {item.consultationNumber}
                      </strong>
                    </td>

                    <td>
                      <div className="consultation-person">
                        <strong>{patientName(item.patient)}</strong>
                        <small>{item.patient?.uhid || "—"}</small>
                      </div>
                    </td>

                    <td>
                      <div className="consultation-person">
                        <strong>{doctorName(item.doctor)}</strong>
                        <small>{item.doctor?.specialization || "—"}</small>
                      </div>
                    </td>

                    <td>
                      {item.appointment?.appointmentNumber || "—"}
                    </td>

                    <td>{formatDate(item.createdAt)}</td>

                    <td>
                      <span className="consultation-diagnosis">
                        {item.diagnosis || "Not entered"}
                      </span>
                    </td>

                    <td>
                      <span className={`consultation-status status-${item.status}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/consultations/${item._id}`}
                        className="consultation-view-link"
                        title="View consultation"
                      >
                        <Eye size={17} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="consultation-table-footer">
            Showing {filtered.length} consultation(s)
          </div>
        )}
      </section>
    </div>
  );
}
