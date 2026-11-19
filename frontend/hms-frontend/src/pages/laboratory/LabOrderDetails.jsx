
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  FlaskConical,
  UserRound,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Save,
  ClipboardCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getLabOrderById,
  collectLabSample,
  updateLabResults,
  completeLabOrder,
} from "../../services/laboratoryService";

import "./lab-order-details.css";

const STATUS_LABELS = {
  requested: "Requested",
  sample_collected: "Sample Collected",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const getError = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

const patientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
  "Unknown patient";

const doctorName = (doctor) => doctor?.user?.name || "Unknown doctor";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LabOrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const role = user?.role;
  const canEnterResults = ["super_admin", "lab_technician"].includes(role);
  const canCollect = canEnterResults;

  const [order, setOrder] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLabOrderById(id);
      setOrder(data);

      const initialResults = {};

      (data.tests || []).forEach((item) => {
        const testId = item.test?._id || item.test;

        (item.parameters || []).forEach((parameter) => {
          const key = `${testId}_${parameter.name}`;

          initialResults[key] = {
            value: parameter.value || "",
            flag: parameter.flag || "normal",
            remarks: parameter.remarks || "",
          };
        });
      });

      setResults(initialResults);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const updateResult = (key, field, value) => {
    setResults((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value,
      },
    }));
  };

  const handleCollect = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await collectLabSample(id);
      setSuccess("Sample collection recorded successfully.");
      await loadOrder();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResults = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        tests: (order.tests || []).map((item) => {
          const testId = item.test?._id || item.test;

          return {
            testId,
            parameters: (item.parameters || []).map((parameter) => {
              const key = `${testId}_${parameter.name}`;
              const result = results[key] || {};

              return {
                name: parameter.name,
                value: result.value || "",
                flag: result.flag || "normal",
                remarks: result.remarks || "",
              };
            }),
          };
        }),
      };

      await updateLabResults(id, payload);

      setSuccess("Laboratory results saved successfully.");
      await loadOrder();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to complete this laboratory report?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await completeLabOrder(id);

      setSuccess("Laboratory report completed successfully.");
      await loadOrder();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lab-detail-loading">
        <RefreshCw className="spin" size={25} />
        <p>Loading laboratory order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="lab-detail-page">
        <div className="lab-detail-alert error">
          {error || "Laboratory order not found."}
        </div>
        <Link to="/laboratory" className="lab-detail-back">
          <ArrowLeft size={16} /> Back to Laboratory
        </Link>
      </div>
    );
  }

  const isEditable = canEnterResults &&
    ["sample_collected", "processing"].includes(order.status);

  const tests = order.tests || [];

  return (
    <div className="lab-detail-page">
      <div className="lab-detail-heading">
        <div>
          <Link to="/laboratory" className="lab-detail-back">
            <ArrowLeft size={16} /> Back to Laboratory
          </Link>
          <span className="eyebrow">LABORATORY REPORT</span>
          <h1>{order.orderNumber}</h1>
          <p>View test details, sample status and laboratory results.</p>
        </div>

        <span className={`lab-status status-${order.status}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {error && (
        <div className="lab-detail-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="lab-detail-alert success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <div className="lab-detail-info-grid">
        <section className="lab-detail-card">
          <div className="lab-detail-card-title">
            <UserRound size={18} />
            <h2>Patient information</h2>
          </div>

          <div className="lab-detail-info">
            <span>Patient name</span>
            <strong>{patientName(order.patient)}</strong>
          </div>
          <div className="lab-detail-info">
            <span>UHID</span>
            <strong>{order.patient?.uhid || "—"}</strong>
          </div>
          <div className="lab-detail-info">
            <span>Phone</span>
            <strong>{order.patient?.phone || "—"}</strong>
          </div>
        </section>

        <section className="lab-detail-card">
          <div className="lab-detail-card-title">
            <FlaskConical size={18} />
            <h2>Order information</h2>
          </div>

          <div className="lab-detail-info">
            <span>Requested by</span>
            <strong>{doctorName(order.doctor)}</strong>
          </div>
          <div className="lab-detail-info">
            <span>Priority</span>
            <strong>{order.priority || "Routine"}</strong>
          </div>
          <div className="lab-detail-info">
            <span>Order date</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
        </section>

        <section className="lab-detail-card">
          <div className="lab-detail-card-title">
            <CalendarDays size={18} />
            <h2>Sample information</h2>
          </div>

          <div className="lab-detail-info">
            <span>Collected at</span>
            <strong>{formatDate(order.collectedAt)}</strong>
          </div>
          <div className="lab-detail-info">
            <span>Completed at</span>
            <strong>{formatDate(order.completedAt)}</strong>
          </div>
          <div className="lab-detail-info">
            <span>Notes</span>
            <strong>{order.notes || "—"}</strong>
          </div>
        </section>
      </div>

      <section className="lab-detail-card lab-results-card">
        <div className="lab-detail-section-heading">
          <div>
            <h2>Requested tests and results</h2>
            <p>Review each test and enter the measured values.</p>
          </div>

          <span className="lab-detail-count">
            {tests.length} test(s)
          </span>
        </div>

        {tests.map((item, index) => {
          const testId = item.test?._id || item.test;
          const testName = item.name || item.test?.name || "Laboratory test";
          const testCode = item.code || item.test?.code || "—";

          return (
            <div className="lab-result-test" key={testId || index}>
              <div className="lab-result-test-heading">
                <div>
                  <h3>{testName}</h3>
                  <span>
                    {testCode} · {item.specimen || "Specimen not specified"}
                  </span>
                </div>

                <span className={`lab-test-active ${
                  item.status === "completed" ? "active" : "inactive"
                }`}>
                  {item.status || "requested"}
                </span>
              </div>

              <div className="lab-result-table-wrap">
                <table className="lab-result-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Reference range</th>
                      <th>Unit</th>
                      <th>Result</th>
                      <th>Flag</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(item.parameters || []).map((parameter) => {
                      const key = `${testId}_${parameter.name}`;
                      const result = results[key] || {};

                      return (
                        <tr key={key}>
                          <td><strong>{parameter.name}</strong></td>
                          <td>{parameter.referenceRange || "—"}</td>
                          <td>{parameter.unit || "—"}</td>
                          <td>
                            {isEditable ? (
                              <input
                                className="lab-result-input"
                                value={result.value || ""}
                                onChange={(event) =>
                                  updateResult(key, "value", event.target.value)
                                }
                                placeholder="Enter result"
                              />
                            ) : (
                              <strong>{parameter.value || "—"}</strong>
                            )}
                          </td>
                          <td>
                            {isEditable ? (
                              <select
                                className="lab-result-select"
                                value={result.flag || "normal"}
                                onChange={(event) =>
                                  updateResult(key, "flag", event.target.value)
                                }
                              >
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            ) : (
                              <span className={`lab-result-flag flag-${parameter.flag || "normal"}`}>
                                {parameter.flag || "—"}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditable ? (
                              <input
                                className="lab-result-input"
                                value={result.remarks || ""}
                                onChange={(event) =>
                                  updateResult(key, "remarks", event.target.value)
                                }
                                placeholder="Optional remarks"
                              />
                            ) : (
                              parameter.remarks || "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {order.status === "requested" && canCollect && (
          <div className="lab-detail-actions">
            <button
              className="lab-primary-btn"
              disabled={saving}
              onClick={handleCollect}
            >
              <ClipboardCheck size={17} />
              {saving ? "Updating..." : "Mark Sample Collected"}
            </button>
          </div>
        )}

        {isEditable && (
          <div className="lab-detail-actions">
            <button
              className="lab-secondary-btn"
              disabled={saving}
              onClick={handleSaveResults}
            >
              <Save size={17} />
              Save Results
            </button>

            <button
              className="lab-primary-btn"
              disabled={saving}
              onClick={handleComplete}
            >
              <CheckCircle2 size={17} />
              Complete Report
            </button>
          </div>
        )}

        {order.status === "completed" && (
          <div className="lab-report-complete">
            <CheckCircle2 size={18} />
            This laboratory report has been completed.
          </div>
        )}
      </section>
    </div>
  );
}
