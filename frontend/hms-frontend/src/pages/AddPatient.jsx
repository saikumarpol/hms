
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../services/api";

const initialForm = {
  firstName: "",
  lastName: "",
  gender: "male",
  dateOfBirth: "",
  phone: "",
  email: "",
  bloodGroup: "",
  address: "",
  emergencyContact: "",
};

export default function AddPatient() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        email: form.email || undefined,
        bloodGroup: form.bloodGroup || undefined,
        emergencyContact: form.emergencyContact || undefined,
      };

      const response = await api.post("/patients", payload);
      const patient = response.data?.data;

      navigate(`/patients/${patient._id}`, {
        state: { created: true, uhid: patient.uhid },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Unable to register patient."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <Link to="/patients" className="back-link"><ArrowLeft size={17} /> Back to patients</Link>

      <div className="page-toolbar">
        <div>
          <h1>Register new patient</h1>
          <p>Enter the patient's details to create a hospital record.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel form-panel">
        <div className="form-section-heading">
          <div className="form-section-icon">01</div>
          <div><h3>Personal information</h3><p>Basic patient details</p></div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>First name <span>*</span></label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required minLength="2" placeholder="Enter first name" />
          </div>
          <div className="field">
            <label>Last name <span>*</span></label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Enter last name" />
          </div>
          <div className="field">
            <label>Gender <span>*</span></label>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Date of birth <span>*</span></label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} required />
          </div>
        </div>

        <div className="form-section-heading form-section-next">
          <div className="form-section-icon">02</div>
          <div><h3>Contact information</h3><p>Phone and address details</p></div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Phone number <span>*</span></label>
            <input name="phone" value={form.phone} onChange={handleChange} pattern="[0-9]{10}" maxLength="10" inputMode="numeric" placeholder="10-digit phone number" required />
          </div>
          <div className="field">
            <label>Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="patient@example.com" />
          </div>
          <div className="field">
            <label>Emergency contact</label>
            <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} pattern="[0-9]{10}" maxLength="10" inputMode="numeric" placeholder="10-digit contact number" />
          </div>
          <div className="field">
            <label>Blood group</label>
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
              <option value="">Select blood group</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div className="field full-width">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows="3" maxLength="300" placeholder="Enter complete address" />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <Link to="/patients" className="secondary-btn">Cancel</Link>
          <button className="primary-btn" disabled={loading}>
            <Save size={17} /> {loading ? "Registering..." : "Register patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
