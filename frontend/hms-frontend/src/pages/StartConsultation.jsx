
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardPlus,
  UserRound,
  CalendarDays,
  Activity,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";

import { getAppointments } from "../services/appointmentService";
import { createConsultation } from "../services/consultationService";

const getError = (error) =>
  error.response?.data?.message || "Unable to start consultation.";

const patientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim();

const initialVitals = {
  bloodPressure: "",
  pulse: "",
  temperature: "",
  respiratoryRate: "",
  spo2: "",
  height: "",
  weight: "",
};

export default function StartConsultation() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    chiefComplaint: "",
    symptoms: "",
    diagnosis: "",
    additionalDiagnosis: "",
    treatmentPlan: "",
    clinicalNotes: "",
    followUpDate: "",
    vitals: initialVitals,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAppointments({ status: "checked_in" });
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(getError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedAppointment = useMemo(
    () => appointments.find((item) => item._id === appointmentId),
    [appointments, appointmentId]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateVital = (field, value) => {
    setForm((current) => ({
      ...current,
      vitals: {
        ...current.vitals,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!appointmentId) {
      setError("Please select a checked-in appointment.");
      return;
    }

    if (!form.chiefComplaint.trim()) {
      setError("Chief complaint is required.");
      return;
    }

    try {
      setSaving(true);

      const vitals = {};
      Object.entries(form.vitals).forEach(([key, value]) => {
        if (value.trim() !== "") {
          vitals[key] =
            key === "bloodPressure" ? value.trim() : Number(value);
        }
      });

      const payload = {
        appointmentId,
        chiefComplaint: form.chiefComplaint.trim(),
        symptoms: form.symptoms
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        vitals,
        diagnosis: form.diagnosis.trim(),
        additionalDiagnosis: form.additionalDiagnosis
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        treatmentPlan: form.treatmentPlan.trim(),
        clinicalNotes: form.clinicalNotes.trim(),
        followUpDate: form.followUpDate || null,
      };

      const consultation = await createConsultation(payload);

      navigate(`/consultations/${consultation._id}`, {
        replace: true,
        state: { message: "Consultation started successfully." },
      });
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="consultations-page">
      <div className="consultations-heading">
        <div>
          <Link to="/consultations" className="consultation-back-link">
            <ArrowLeft size={16} /> Back to consultations
          </Link>
          <span className="eyebrow">CLINICAL WORKSPACE</span>
          <h1>Start consultation</h1>
          <p>Record patient symptoms, vital signs and clinical assessment.</p>
        </div>
      </div>

      {error && (
        <div className="consultation-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <form className="consultation-form" onSubmit={handleSubmit}>
        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <CalendarDays size={19} />
            </div>
            <div>
              <h2>Appointment details</h2>
              <p>Select an appointment that has been checked in.</p>
            </div>
          </div>

          <label className="consultation-label">
            Checked-in appointment <span>*</span>
            <select
              value={appointmentId}
              onChange={(event) => setAppointmentId(event.target.value)}
              required
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading appointments..." : "Select appointment"}
              </option>
              {appointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {appointment.appointmentNumber} —{" "}
                  {patientName(appointment.patient)} —{" "}
                  {appointment.startTime}
                </option>
              ))}
            </select>
          </label>

          {!loading && appointments.length === 0 && (
            <div className="consultation-inline-info">
              <AlertCircle size={17} />
              No checked-in appointments are currently available.
            </div>
          )}

          {selectedAppointment && (
            <div className="consultation-selected-patient">
              <div className="consultation-selected-icon">
                <UserRound size={24} />
              </div>
              <div>
                <strong>{patientName(selectedAppointment.patient)}</strong>
                <span>
                  UHID: {selectedAppointment.patient?.uhid || "—"}
                </span>
                <span>
                  Dr. {selectedAppointment.doctor?.user?.name || "—"} ·{" "}
                  {selectedAppointment.doctor?.specialization || "—"}
                </span>
              </div>
              <span className="consultation-status status-in_progress">
                Checked In
              </span>
            </div>
          )}
        </section>

        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <ClipboardPlus size={19} />
            </div>
            <div>
              <h2>Clinical information</h2>
              <p>Record the patient's current complaints and symptoms.</p>
            </div>
          </div>

          <div className="consultation-form-grid">
            <label className="consultation-label full">
              Chief complaint <span>*</span>
              <textarea
                rows="3"
                placeholder="Describe the primary reason for consultation..."
                value={form.chiefComplaint}
                onChange={(event) =>
                  updateField("chiefComplaint", event.target.value)
                }
                required
              />
            </label>

            <label className="consultation-label full">
              Symptoms
              <input
                placeholder="Fever, headache, body pain (comma separated)"
                value={form.symptoms}
                onChange={(event) => updateField("symptoms", event.target.value)}
              />
              <small>Separate multiple symptoms with commas.</small>
            </label>
          </div>
        </section>

        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <Activity size={19} />
            </div>
            <div>
              <h2>Vital signs</h2>
              <p>Enter the patient's measured vital signs.</p>
            </div>
          </div>

          <div className="consultation-form-grid vitals-grid">
            <label className="consultation-label">
              Blood pressure
              <input
                placeholder="120/80"
                value={form.vitals.bloodPressure}
                onChange={(event) =>
                  updateVital("bloodPressure", event.target.value)
                }
              />
              <small>mmHg</small>
            </label>

            <label className="consultation-label">
              Pulse
              <input
                type="number"
                min="0"
                max="300"
                placeholder="72"
                value={form.vitals.pulse}
                onChange={(event) => updateVital("pulse", event.target.value)}
              />
              <small>bpm</small>
            </label>

            <label className="consultation-label">
              Temperature
              <input
                type="number"
                min="25"
                max="45"
                step="0.1"
                placeholder="37.0"
                value={form.vitals.temperature}
                onChange={(event) =>
                  updateVital("temperature", event.target.value)
                }
              />
              <small>°C</small>
            </label>

            <label className="consultation-label">
              Respiratory rate
              <input
                type="number"
                min="0"
                max="100"
                placeholder="18"
                value={form.vitals.respiratoryRate}
                onChange={(event) =>
                  updateVital("respiratoryRate", event.target.value)
                }
              />
              <small>breaths/min</small>
            </label>

            <label className="consultation-label">
              SpO₂
              <input
                type="number"
                min="0"
                max="100"
                placeholder="98"
                value={form.vitals.spo2}
                onChange={(event) => updateVital("spo2", event.target.value)}
              />
              <small>%</small>
            </label>

            <label className="consultation-label">
              Height
              <input
                type="number"
                min="0"
                max="300"
                step="0.1"
                placeholder="170"
                value={form.vitals.height}
                onChange={(event) => updateVital("height", event.target.value)}
              />
              <small>cm</small>
            </label>

            <label className="consultation-label">
              Weight
              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                placeholder="65"
                value={form.vitals.weight}
                onChange={(event) => updateVital("weight", event.target.value)}
              />
              <small>kg</small>
            </label>
          </div>
        </section>

        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <ClipboardPlus size={19} />
            </div>
            <div>
              <h2>Diagnosis and treatment</h2>
              <p>Document your clinical assessment and care plan.</p>
            </div>
          </div>

          <div className="consultation-form-grid">
            <label className="consultation-label full">
              Primary diagnosis
              <textarea
                rows="2"
                placeholder="Enter primary diagnosis..."
                value={form.diagnosis}
                onChange={(event) => updateField("diagnosis", event.target.value)}
              />
            </label>

            <label className="consultation-label full">
              Additional diagnosis
              <input
                placeholder="Diagnosis 1, Diagnosis 2"
                value={form.additionalDiagnosis}
                onChange={(event) =>
                  updateField("additionalDiagnosis", event.target.value)
                }
              />
              <small>Separate multiple diagnoses with commas.</small>
            </label>

            <label className="consultation-label full">
              Treatment plan
              <textarea
                rows="3"
                placeholder="Enter the recommended treatment plan..."
                value={form.treatmentPlan}
                onChange={(event) =>
                  updateField("treatmentPlan", event.target.value)
                }
              />
            </label>

            <label className="consultation-label full">
              Clinical notes
              <textarea
                rows="4"
                placeholder="Additional examination findings and notes..."
                value={form.clinicalNotes}
                onChange={(event) =>
                  updateField("clinicalNotes", event.target.value)
                }
              />
            </label>

            <label className="consultation-label">
              Follow-up date
              <input
                type="date"
                value={form.followUpDate}
                onChange={(event) =>
                  updateField("followUpDate", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <div className="consultation-form-actions">
          <Link to="/consultations" className="consultation-secondary-btn">
            Cancel
          </Link>

          <button
            type="submit"
            className="consultation-primary-btn"
            disabled={saving || loading || !appointments.length}
          >
            <Save size={17} />
            {saving ? "Starting..." : "Start consultation"}
          </button>
        </div>
      </form>
    </div>
  );
}
