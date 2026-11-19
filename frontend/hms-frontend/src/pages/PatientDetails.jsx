
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, UserRound, Phone, Mail, MapPin, Droplets } from "lucide-react";
import api from "../services/api";

export default function PatientDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/patients/${id}`)
      .then((response) => setPatient(response.data?.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load patient."));
  }, [id]);

  if (error) return <div className="error-message">{error}</div>;
  if (!patient) return <div className="panel empty-state">Loading patient details...</div>;

  return (
    <div className="page-stack">
      <Link to="/patients" className="back-link"><ArrowLeft size={17} /> Back to patients</Link>

      {location.state?.created && (
        <div className="success-message">
          Patient registered successfully. UHID: <strong>{location.state.uhid}</strong>
        </div>
      )}

      <div className="panel patient-profile-card">
        <div className="patient-profile-top">
          <div className="large-avatar">{patient.firstName?.charAt(0)?.toUpperCase()}</div>
          <div>
            <span className="eyebrow">PATIENT PROFILE</span>
            <h1>{patient.firstName} {patient.lastName}</h1>
            <span className="uhid">{patient.uhid}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item"><UserRound /><div><small>Gender</small><strong className="capitalize">{patient.gender}</strong></div></div>
          <div className="detail-item"><Phone /><div><small>Phone</small><strong>{patient.phone}</strong></div></div>
          <div className="detail-item"><Mail /><div><small>Email</small><strong>{patient.email || "Not provided"}</strong></div></div>
          <div className="detail-item"><Droplets /><div><small>Blood group</small><strong>{patient.bloodGroup || "Not provided"}</strong></div></div>
          <div className="detail-item"><MapPin /><div><small>Address</small><strong>{patient.address || "Not provided"}</strong></div></div>
          <div className="detail-item"><Phone /><div><small>Emergency contact</small><strong>{patient.emergencyContact || "Not provided"}</strong></div></div>
        </div>
      </div>
    </div>
  );
}
