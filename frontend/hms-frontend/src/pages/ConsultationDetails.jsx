
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  CalendarDays,
  Activity,
  ClipboardPlus,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";

import {
  getConsultationById,
  updateConsultation,
  completeConsultation,
} from "../services/consultationService";

const getError = (error) =>
  error.response?.data?.message || "Something went wrong.";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const patientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim();

const emptyVitals = {
  bloodPressure: "",
  pulse: "",
  temperature: "",
  respiratoryRate: "",
  spo2: "",
  height: "",
  weight: "",
};

export default function ConsultationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");

  const [form, setForm] = useState({
    chiefComplaint: "",
    symptoms: "",
    vitals: emptyVitals,
    diagnosis: "",
    additionalDiagnosis: "",
    treatmentPlan: "",
    clinicalNotes: "",
    followUpDate: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getConsultationById(id);
        setConsultation(data);

        setForm({
          chiefComplaint: data.chiefComplaint || "",
          symptoms: (data.symptoms || []).join(", "),
          vitals: {
            bloodPressure: data.vitals?.bloodPressure || "",
            pulse: data.vitals?.pulse ?? "",
            temperature: data.vitals?.temperature ?? "",
            respiratoryRate: data.vitals?.respiratoryRate ?? "",
            spo2: data.vitals?.spo2 ?? "",
            height: data.vitals?.height ?? "",
            weight: data.vitals?.weight ?? "",
          },
          diagnosis: data.diagnosis || "",
          additionalDiagnosis: (data.additionalDiagnosis || []).join(", "),
          treatmentPlan: data.treatmentPlan || "",
          clinicalNotes: data.clinicalNotes || "",
          followUpDate: data.followUpDate
            ? new Date(data.followUpDate).toISOString().slice(0, 10)
            : "",
        });
      } catch (err) {
        setError(getError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateVital = (field, value) => {
    setForm((current) => ({
      ...current,
      vitals: { ...current.vitals, [field]: value },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const vitals = {};
      Object.entries(form.vitals).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          vitals[key] =
            key === "bloodPressure" ? String(value) : Number(value);
        }
      });

      const payload = {
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

      const updated = await updateConsultation(id, payload);
      setConsultation(updated);
      setSuccess("Consultation details saved successfully.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!form.diagnosis.trim()) {
      setError("Enter a diagnosis before completing the consultation.");
      return;
    }

    const confirmed = window.confirm(
      "Complete this consultation? The linked appointment will also be marked completed. This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setCompleting(true);
      setError("");
      setSuccess("");

      // Save the latest form values before completing.
      const vitals = {};
      Object.entries(form.vitals).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          vitals[key] =
            key === "bloodPressure" ? String(value) : Number(value);
        }
      });

      await updateConsultation(id, {
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
      });

      const completed = await completeConsultation(id);
      setConsultation(completed);
      setSuccess("Consultation completed successfully.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="consultation-empty">
        <Clock3 size={24} />
        <p>Loading consultation...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="consultation-alert error">
        <AlertCircle size={17} />
        {error || "Consultation not found."}
        <Link to="/consultations">Back to consultations</Link>
      </div>
    );
  }

  const isCompleted = consultation.status === "completed";
  const patient = consultation.patient;
  const doctor = consultation.doctor;

  return (
    <div className="consultations-page">
      <div className="consultations-heading">
        <div>
          <Link to="/consultations" className="consultation-back-link">
            <ArrowLeft size={16} /> Back to consultations
          </Link>
          <span className="eyebrow">CLINICAL RECORD</span>
          <h1>{consultation.consultationNumber}</h1>
          <p>Review and manage the patient's consultation record.</p>
        </div>

        <span className={`consultation-status status-${consultation.status}`}>
          {isCompleted ? "Completed" : "In Progress"}
        </span>
      </div>

      {error && (
        <div className="consultation-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="consultation-alert success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <div className="consultation-patient-summary">
        <div className="consultation-summary-item">
          <div className="consultation-section-icon">
            <UserRound size={20} />
          </div>
          <div>
            <small>Patient</small>
            <strong>{patientName(patient) || "Unknown patient"}</strong>
            <span>{patient?.uhid || "—"}</span>
          </div>
        </div>

        <div className="consultation-summary-item">
          <div className="consultation-section-icon">
            <ClipboardPlus size={20} />
          </div>
          <div>
            <small>Doctor</small>
            <strong>{doctor?.user?.name || "—"}</strong>
            <span>{doctor?.specialization || "—"}</span>
          </div>
        </div>

        <div className="consultation-summary-item">
          <div className="consultation-section-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <small>Appointment</small>
            <strong>
              {consultation.appointment?.appointmentNumber || "—"}
            </strong>
            <span>{formatDate(consultation.appointment?.appointmentDate)}</span>
          </div>
        </div>
      </div>

      <form className="consultation-form" onSubmit={handleSave}>
        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <ClipboardPlus size={19} />
            </div>
            <div>
              <h2>Clinical information</h2>
              <p>Chief complaint and reported symptoms.</p>
            </div>
          </div>

          <div className="consultation-form-grid">
            <label className="consultation-label full">
              Chief complaint
              <textarea
                rows="3"
                value={form.chiefComplaint}
                disabled={isCompleted}
                onChange={(event) =>
                  updateField("chiefComplaint", event.target.value)
                }
              />
            </label>

            <label className="consultation-label full">
              Symptoms
              <input
                value={form.symptoms}
                disabled={isCompleted}
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
              <p>Recorded patient measurements.</p>
            </div>
          </div>

          <div className="consultation-form-grid vitals-grid">
            {[
              ["bloodPressure", "Blood pressure", "120/80", "mmHg", "text"],
              ["pulse", "Pulse", "72", "bpm", "number"],
              ["temperature", "Temperature", "37.0", "°C", "number"],
              ["respiratoryRate", "Respiratory rate", "18", "breaths/min", "number"],
              ["spo2", "SpO₂", "98", "%", "number"],
              ["height", "Height", "170", "cm", "number"],
              ["weight", "Weight", "65", "kg", "number"],
            ].map(([key, label, placeholder, unit, type]) => (
              <label className="consultation-label" key={key}>
                {label}
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form.vitals[key]}
                  disabled={isCompleted}
                  onChange={(event) => updateVital(key, event.target.value)}
                />
                <small>{unit}</small>
              </label>
            ))}
          </div>
        </section>

        <section className="consultation-form-section">
          <div className="consultation-section-title">
            <div className="consultation-section-icon">
              <ClipboardPlus size={19} />
            </div>
            <div>
              <h2>Diagnosis and treatment</h2>
              <p>Clinical assessment and recommended care.</p>
            </div>
          </div>

          <div className="consultation-form-grid">
            <label className="consultation-label full">
              Primary diagnosis
              <textarea
                rows="2"
                value={form.diagnosis}
                disabled={isCompleted}
                onChange={(event) => updateField("diagnosis", event.target.value)}
              />
            </label>

            <label className="consultation-label full">
              Additional diagnosis
              <input
                value={form.additionalDiagnosis}
                disabled={isCompleted}
                onChange={(event) =>
                  updateField("additionalDiagnosis", event.target.value)
                }
              />
            </label>

            <label className="consultation-label full">
              Treatment plan
              <textarea
                rows="3"
                value={form.treatmentPlan}
                disabled={isCompleted}
                onChange={(event) =>
                  updateField("treatmentPlan", event.target.value)
                }
              />
            </label>

            <label className="consultation-label full">
              Clinical notes
              <textarea
                rows="4"
                value={form.clinicalNotes}
                disabled={isCompleted}
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
                disabled={isCompleted}
                onChange={(event) =>
                  updateField("followUpDate", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        {!isCompleted && (
          <div className="consultation-form-actions">
            <Link to="/consultations" className="consultation-secondary-btn">
              Back
            </Link>

            <button
              type="submit"
              className="consultation-secondary-btn"
              disabled={saving || completing}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              className="consultation-primary-btn"
              disabled={saving || completing}
              onClick={handleComplete}
            >
              <CheckCircle2 size={17} />
              {completing ? "Completing..." : "Complete consultation"}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="consultation-completed-note">
            <CheckCircle2 size={19} />
            This consultation is completed and is read-only.
          </div>
        )}
      </form>
    </div>
  );
}
