
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";

import { getConsultations } from "../../services/consultationService";
import {
  getLabTests,
  createLabOrder,
} from "../../services/laboratoryService";

import "./new-lab-order.css";

const getError = (error) =>
  error.response?.data?.message || "Unable to create laboratory order.";

const patientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
  "Unknown patient";

export default function NewLabOrder() {
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [tests, setTests] = useState([]);
  const [consultationId, setConsultationId] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [priority, setPriority] = useState("routine");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [consultationData, testData] = await Promise.all([
          getConsultations(),
          getLabTests(),
        ]);

        setConsultations(Array.isArray(consultationData) ? consultationData : []);
        setTests(Array.isArray(testData) ? testData : []);
      } catch (err) {
        setError(getError(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedConsultation = consultations.find(
    (item) => item._id === consultationId
  );

  const filteredTests = tests.filter((test) => {
    const query = search.trim().toLowerCase();

    return (
      test.name?.toLowerCase().includes(query) ||
      test.code?.toLowerCase().includes(query) ||
      test.category?.toLowerCase().includes(query)
    );
  });

  const toggleTest = (testId) => {
    setSelectedTests((current) =>
      current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId]
    );
  };

  const totalPrice = tests
    .filter((test) => selectedTests.includes(test._id))
    .reduce((total, test) => total + Number(test.price || 0), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!consultationId) {
      setError("Please select a consultation.");
      return;
    }

    if (selectedTests.length === 0) {
      setError("Please select at least one laboratory test.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await createLabOrder({
        consultationId,
        testIds: selectedTests,
        priority,
        notes: notes.trim(),
      });

      navigate(`/laboratory/orders/${result._id}`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="new-lab-loading">Loading consultations and tests...</div>;
  }

  return (
    <div className="new-lab-page">
      <div className="new-lab-heading">
        <div>
          <Link to="/laboratory" className="new-lab-back">
            <ArrowLeft size={16} /> Back to Laboratory
          </Link>
          <span className="eyebrow">CLINICAL OPERATIONS</span>
          <h1>Request Laboratory Tests</h1>
          <p>Select a patient consultation and the required tests.</p>
        </div>
      </div>

      {error && (
        <div className="lab-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="new-lab-form">
        <section className="new-lab-panel">
          <div className="new-lab-panel-heading">
            <h2>1. Select consultation</h2>
            <p>Patient and doctor information will be inherited from this consultation.</p>
          </div>

          <label className="new-lab-label">
            Consultation *
            <select
              required
              value={consultationId}
              onChange={(event) => setConsultationId(event.target.value)}
            >
              <option value="">Select consultation</option>
              {consultations.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.consultationNumber} — {patientName(item.patient)}
                  {item.patient?.uhid ? ` (${item.patient.uhid})` : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedConsultation && (
            <div className="new-lab-patient-summary">
              <div>
                <span>Patient</span>
                <strong>{patientName(selectedConsultation.patient)}</strong>
              </div>
              <div>
                <span>UHID</span>
                <strong>{selectedConsultation.patient?.uhid || "—"}</strong>
              </div>
              <div>
                <span>Doctor</span>
                <strong>
                  {selectedConsultation.doctor?.user?.name || "—"}
                </strong>
              </div>
              <div>
                <span>Consultation</span>
                <strong>{selectedConsultation.consultationNumber || "—"}</strong>
              </div>
            </div>
          )}

          {consultations.length === 0 && (
            <p className="new-lab-hint">
              No consultations available. Start a consultation before requesting tests.
            </p>
          )}
        </section>

        <section className="new-lab-panel">
          <div className="new-lab-panel-heading">
            <h2>2. Select tests</h2>
            <p>Choose one or more tests from the catalogue.</p>
          </div>

          <div className="new-lab-search">
            <Search size={17} />
            <input
              placeholder="Search tests by name, code or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {filteredTests.length === 0 ? (
            <div className="new-lab-empty">
              <FlaskConical size={28} />
              <p>No active tests found.</p>
            </div>
          ) : (
            <div className="new-lab-test-list">
              {filteredTests.map((test) => {
                const checked = selectedTests.includes(test._id);

                return (
                  <label
                    key={test._id}
                    className={`new-lab-test-option ${checked ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTest(test._id)}
                    />

                    <div className="new-lab-test-info">
                      <strong>{test.name}</strong>
                      <small>
                        {test.code} · {test.category} · {test.specimen}
                      </small>
                      <small>
                        {test.parameters?.length || 0} parameters · {test.turnaroundHours} hours
                      </small>
                    </div>

                    <strong className="new-lab-test-price">
                      ₹{Number(test.price || 0).toLocaleString("en-IN")}
                    </strong>
                  </label>
                );
              })}
            </div>
          )}

          <div className="new-lab-selection-summary">
            <span>{selectedTests.length} test(s) selected</span>
            <strong>Estimated total: ₹{totalPrice.toLocaleString("en-IN")}</strong>
          </div>
        </section>

        <section className="new-lab-panel">
          <div className="new-lab-panel-heading">
            <h2>3. Order details</h2>
            <p>Set the priority and add optional instructions.</p>
          </div>

          <label className="new-lab-label">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </label>

          <label className="new-lab-label">
            Notes
            <textarea
              rows="3"
              maxLength="1000"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Additional instructions for the laboratory..."
            />
          </label>
        </section>

        <div className="new-lab-footer">
          <button
            type="button"
            className="lab-cancel-btn"
            onClick={() => navigate("/laboratory")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="lab-primary-btn"
            disabled={saving || !consultationId || selectedTests.length === 0}
          >
            <Send size={16} />
            {saving ? "Creating order..." : "Create Lab Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
