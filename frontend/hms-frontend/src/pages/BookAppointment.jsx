
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getPatientsForAppointment,
  getDoctorsForAppointment,
  createAppointment,
} from "../services/appointmentService";

import "./appointments.css";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to complete the request.";

const localDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

export default function BookAppointment() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: localDate(),
    startTime: "09:00",
    durationMinutes: 15,
    reason: "",
    notes: "",
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const [patientData, doctorData] = await Promise.all([
          getPatientsForAppointment(),
          getDoctorsForAppointment(),
        ]);

        setPatients(Array.isArray(patientData) ? patientData : []);
        setDoctors(
          Array.isArray(doctorData)
            ? doctorData.filter((doctor) => doctor.isAvailable)
            : []
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const selectedDoctor = doctors.find(
    (doctor) => doctor._id === form.doctorId
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "durationMinutes" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.patientId || !form.doctorId) {
      setError("Please select both a patient and a doctor.");
      return;
    }

    try {
      setSubmitting(true);

      const appointment = await createAppointment({
        ...form,
        durationMinutes: Number(form.durationMinutes),
      });

      setSuccess(
        `Appointment ${appointment.appointmentNumber} booked successfully.`
      );

      setTimeout(() => navigate("/appointments"), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="appointments-page">
      <div className="appointments-heading">
        <div>
          <Link to="/appointments" className="appointment-back-link">
            <ArrowLeft size={16} />
            Back to appointments
          </Link>
          <span className="eyebrow">HOSPITAL OPERATIONS</span>
          <h1>Book appointment</h1>
          <p>Create a new appointment for a patient with a doctor.</p>
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

      <form className="booking-panel" onSubmit={handleSubmit}>
        <div className="booking-section-heading">
          <div className="booking-section-icon">
            <UserRound size={19} />
          </div>
          <div>
            <h2>Patient and doctor</h2>
            <p>Select the patient and medical professional.</p>
          </div>
        </div>

        <div className="booking-form-grid">
          <div className="booking-field">
            <label htmlFor="patientId">Select patient <span>*</span></label>
            <select
              id="patientId"
              name="patientId"
              value={form.patientId}
              onChange={updateField}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "Loading patients..." : "Choose a patient"}
              </option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName} — {patient.uhid}
                </option>
              ))}
            </select>
            {!loadingOptions && patients.length === 0 && (
              <small>No patients found. Register a patient first.</small>
            )}
          </div>

          <div className="booking-field">
            <label htmlFor="doctorId">Select doctor <span>*</span></label>
            <select
              id="doctorId"
              name="doctorId"
              value={form.doctorId}
              onChange={updateField}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "Loading doctors..." : "Choose a doctor"}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.user?.name || "Doctor"} — {doctor.specialization}
                </option>
              ))}
            </select>
            {!loadingOptions && doctors.length === 0 && (
              <small>No available doctors found.</small>
            )}
          </div>
        </div>

        {selectedDoctor && (
          <div className="selected-doctor-info">
            <Stethoscope size={18} />
            <div>
              <strong>{selectedDoctor.user?.name}</strong>
              <span>
                {selectedDoctor.qualification} · {selectedDoctor.experience} years
                experience
              </span>
            </div>
            <strong className="doctor-fee">
              ₹{selectedDoctor.consultationFee}
            </strong>
          </div>
        )}

        <div className="booking-divider" />

        <div className="booking-section-heading">
          <div className="booking-section-icon">
            <CalendarDays size={19} />
          </div>
          <div>
            <h2>Appointment schedule</h2>
            <p>Choose the date, time and appointment duration.</p>
          </div>
        </div>

        <div className="booking-form-grid">
          <div className="booking-field">
            <label htmlFor="appointmentDate">Appointment date <span>*</span></label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              min={localDate()}
              value={form.appointmentDate}
              onChange={updateField}
              required
            />
          </div>

          <div className="booking-field">
            <label htmlFor="startTime">Start time <span>*</span></label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={form.startTime}
              onChange={updateField}
              required
            />
          </div>

          <div className="booking-field">
            <label htmlFor="durationMinutes">Duration <span>*</span></label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={updateField}
              required
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div className="booking-field">
            <label> <Clock3 size={14} /> Appointment end time</label>
            <input
              type="text"
              value={(() => {
                const [hours, minutes] = form.startTime.split(":").map(Number);
                const total = hours * 60 + minutes + Number(form.durationMinutes);
                if (total > 1440) return "Beyond midnight";
                return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
              })()}
              readOnly
            />
          </div>
        </div>

        <div className="booking-divider" />

        <div className="booking-field booking-full-field">
          <label htmlFor="reason">Reason for visit <span>*</span></label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="e.g. General consultation, chest pain, follow-up..."
            value={form.reason}
            onChange={updateField}
            maxLength={500}
            required
          />
        </div>

        <div className="booking-field booking-full-field">
          <label htmlFor="notes">Additional notes</label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Add any additional information for the appointment..."
            value={form.notes}
            onChange={updateField}
            maxLength={1000}
            rows={4}
          />
        </div>

        <div className="booking-footer">
          <Link to="/appointments" className="appointment-cancel-btn">
            Cancel
          </Link>

          <button
            type="submit"
            className="appointment-primary-btn"
            disabled={submitting || loadingOptions || patients.length === 0 || doctors.length === 0}
          >
            <CalendarDays size={17} />
            {submitting ? "Booking..." : "Confirm appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
