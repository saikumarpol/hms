
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Search,
  RefreshCw,
  Clock3,
  UserRound,
  Stethoscope,
  Filter,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getAppointments,
  updateAppointmentStatus,
} from "../services/appointmentService";

import "./appointments.css";

const STATUS_OPTIONS = {
  scheduled: ["confirmed", "checked_in", "cancelled", "no_show"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["in_consultation", "cancelled"],
  in_consultation: ["completed"],
  completed: [],
  cancelled: [],
  no_show: [],
};

const STATUS_LABELS = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPatientName = (patient) => {
  if (!patient) return "Unknown patient";
  return `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
};

const getDoctorName = (doctor) => doctor?.user?.name || "Unknown doctor";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (date) filters.date = date;
      if (status) filters.status = status;

      const data = await getAppointments(filters);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [date, status]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusChange = async (appointmentId, nextStatus) => {
    try {
      setUpdatingId(appointmentId);
      setError("");
      setSuccess("");

      await updateAppointmentStatus(appointmentId, nextStatus);

      setSuccess("Appointment status updated successfully.");
      await loadAppointments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.patient).toLowerCase();
    const doctorName = getDoctorName(appointment.doctor).toLowerCase();

    return (
      patientName.includes(normalizedSearch) ||
      doctorName.includes(normalizedSearch) ||
      (appointment.appointmentNumber || "").toLowerCase().includes(normalizedSearch) ||
      (appointment.patient?.uhid || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const today = new Date().toISOString().slice(0, 10);

  const todayCount = appointments.filter(
    (item) => item.appointmentDate?.slice(0, 10) === today
  ).length;

  const scheduledCount = appointments.filter(
    (item) => ["scheduled", "confirmed"].includes(item.status)
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="appointments-page">
      <div className="appointments-heading">
        <div>
          <span className="eyebrow">HOSPITAL OPERATIONS</span>
          <h1>Appointments</h1>
          <p>Schedule and manage patient appointments.</p>
        </div>

        <Link to="/appointments/new" className="appointment-primary-btn">
          <Plus size={18} />
          Book Appointment
        </Link>
      </div>

      <div className="appointment-stats">
        <div className="appointment-stat-card">
          <div className="appointment-stat-icon blue">
            <CalendarDays size={20} />
          </div>
          <div>
            <span>Today's appointments</span>
            <strong>{todayCount}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon amber">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Upcoming / scheduled</span>
            <strong>{scheduledCount}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon violet">
            <UserRound size={20} />
          </div>
          <div>
            <span>Total loaded</span>
            <strong>{appointments.length}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="appointment-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="appointment-alert success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <section className="appointment-panel">
        <div className="appointment-panel-heading">
          <div>
            <h2>Appointment list</h2>
            <p>View and manage your hospital appointments.</p>
          </div>

          <button
            type="button"
            className="appointment-icon-button"
            onClick={loadAppointments}
            title="Refresh appointments"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="appointment-filters">
          <div className="appointment-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search patient, doctor or appointment ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="appointment-filter-control">
            <Filter size={16} />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Filter by date"
            />
          </div>

          <select
            className="appointment-filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="appointment-table-wrap">
          {loading ? (
            <div className="appointment-empty">
              <RefreshCw className="spin" size={24} />
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="appointment-empty">
              <CalendarDays size={32} />
              <h3>No appointments found</h3>
              <p>Try changing your filters or book a new appointment.</p>
              <Link to="/appointments/new" className="appointment-text-link">
                Book an appointment
              </Link>
            </div>
          ) : (
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Appointment</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Update status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const nextStatuses = STATUS_OPTIONS[appointment.status] || [];

                  return (
                    <tr key={appointment._id}>
                      <td>
                        <strong className="appointment-number">
                          {appointment.appointmentNumber}
                        </strong>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <strong>{getPatientName(appointment.patient)}</strong>
                          <small>{appointment.patient?.uhid || "—"}</small>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <strong>{getDoctorName(appointment.doctor)}</strong>
                          <small>{appointment.doctor?.specialization || "—"}</small>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <strong>{formatDate(appointment.appointmentDate)}</strong>
                          <small>
                            {appointment.startTime} – {appointment.endTime}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className="appointment-reason" title={appointment.reason}>
                          {appointment.reason || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={`appointment-status status-${appointment.status}`}>
                          {STATUS_LABELS[appointment.status] || appointment.status}
                        </span>
                      </td>

                      <td>
                        {nextStatuses.length > 0 ? (
                          <select
                            className="appointment-status-select"
                            value=""
                            disabled={updatingId === appointment._id}
                            onChange={(event) =>
                              handleStatusChange(appointment._id, event.target.value)
                            }
                            aria-label={`Update status for ${appointment.appointmentNumber}`}
                          >
                            <option value="">
                              {updatingId === appointment._id ? "Updating..." : "Change"}
                            </option>
                            {nextStatuses.map((nextStatus) => (
                              <option key={nextStatus} value={nextStatus}>
                                {STATUS_LABELS[nextStatus]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="appointment-muted">No changes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredAppointments.length > 0 && (
          <div className="appointment-table-footer">
            Showing {filteredAppointments.length} appointment(s)
          </div>
        )}
      </section>
    </div>
  );
}
