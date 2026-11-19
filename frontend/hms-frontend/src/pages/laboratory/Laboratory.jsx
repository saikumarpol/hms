
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FlaskConical,
  Clock3,
  CheckCircle2,
  Activity,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  TestTube2,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getLabOrders,
  collectLabSample,
} from "../../services/laboratoryService";

import "./laboratory.css";

const STATUS_LABELS = {
  requested: "Requested",
  sample_collected: "Sample Collected",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_LABELS = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

const getError = (error) =>
  error.response?.data?.message ||
  "Something went wrong. Please try again.";

const getPatientName = (patient) =>
  `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
  "Unknown patient";

const getDoctorName = (doctor) =>
  doctor?.user?.name || "Unknown doctor";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Laboratory() {
  const { user } = useAuth();

  const canRequestTests = ["doctor", "super_admin"].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (status) filters.status = status;

      const data = await getLabOrders(filters);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCollectSample = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      await collectLabSample(orderId);

      setSuccess("Sample marked as collected successfully.");
      await loadOrders();
    } catch (err) {
      setError(getError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const patient = getPatientName(order.patient).toLowerCase();
      const doctor = getDoctorName(order.doctor).toLowerCase();
      const orderNumber = (order.orderNumber || "").toLowerCase();
      const uhid = (order.patient?.uhid || "").toLowerCase();

      const testNames = (order.tests || [])
        .map((item) => `${item.name || ""} ${item.code || ""}`)
        .join(" ")
        .toLowerCase();

      return (
        patient.includes(query) ||
        doctor.includes(query) ||
        orderNumber.includes(query) ||
        uhid.includes(query) ||
        testNames.includes(query)
      );
    });
  }, [orders, search]);

  const requestedCount = orders.filter(
    (item) => item.status === "requested"
  ).length;

  const processingCount = orders.filter(
    (item) =>
      item.status === "processing" ||
      item.status === "sample_collected"
  ).length;

  const completedCount = orders.filter(
    (item) => item.status === "completed"
  ).length;

  const renderTests = (tests = []) => {
    if (!tests.length) return "No tests";

    return tests.map((item) => item.name).filter(Boolean).join(", ");
  };

  return (
    <div className="laboratory-page">
      <div className="laboratory-heading">
        <div>
          <span className="eyebrow">CLINICAL OPERATIONS</span>
          <h1>Laboratory</h1>
          <p>
            Manage test requests, sample collection and laboratory reports.
          </p>
        </div>

        <div className="lab-heading-actions">
          {canRequestTests && (
            <Link
              to="/laboratory/orders/new"
              className="lab-secondary-btn"
            >
              <FlaskConical size={17} />
              Request Tests
            </Link>
          )}

          <Link
            to="/laboratory/tests"
            className="lab-primary-btn"
          >
            <TestTube2 size={18} />
            Test Catalogue
          </Link>
        </div>
      </div>

      {error && (
        <div className="lab-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="lab-alert success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <div className="lab-stats">
        <div className="lab-stat-card">
          <div className="lab-stat-icon blue">
            <ClipboardList size={20} />
          </div>
          <div>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="lab-stat-card">
          <div className="lab-stat-icon amber">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Pending requests</span>
            <strong>{requestedCount}</strong>
          </div>
        </div>

        <div className="lab-stat-card">
          <div className="lab-stat-icon violet">
            <Activity size={20} />
          </div>
          <div>
            <span>In progress</span>
            <strong>{processingCount}</strong>
          </div>
        </div>

        <div className="lab-stat-card">
          <div className="lab-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed reports</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </div>

      <section className="lab-panel">
        <div className="lab-panel-heading">
          <div>
            <h2>Laboratory orders</h2>
            <p>View test requests and manage their progress.</p>
          </div>

          <button
            type="button"
            className="lab-icon-button"
            onClick={loadOrders}
            title="Refresh orders"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="lab-filters">
          <div className="lab-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search patient, UHID, order or test..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="lab-filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="lab-table-wrap">
          {loading ? (
            <div className="lab-empty">
              <RefreshCw className="spin" size={24} />
              <p>Loading laboratory orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="lab-empty">
              <FlaskConical size={34} />
              <h3>No laboratory orders found</h3>
              <p>Test requests created by doctors will appear here.</p>
              {canRequestTests && (
                <Link
                  to="/laboratory/orders/new"
                  className="lab-empty-link"
                >
                  Create your first test request
                </Link>
              )}
            </div>
          ) : (
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Tests</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong className="lab-order-number">
                        {order.orderNumber || "—"}
                      </strong>
                    </td>

                    <td>
                      <div className="lab-person">
                        <strong>{getPatientName(order.patient)}</strong>
                        <small>{order.patient?.uhid || "—"}</small>
                      </div>
                    </td>

                    <td>
                      <div className="lab-person">
                        <strong>{getDoctorName(order.doctor)}</strong>
                        <small>{order.doctor?.specialization || "—"}</small>
                      </div>
                    </td>

                    <td>
                      <span className="lab-test-names">
                        {renderTests(order.tests)}
                      </span>
                    </td>

                    <td>
                      <span className={`lab-priority priority-${order.priority}`}>
                        {PRIORITY_LABELS[order.priority] || order.priority || "—"}
                      </span>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <span className={`lab-status status-${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>

                    <td>
                      <div className="lab-actions">
                        {order.status === "requested" && (
                          <button
                            type="button"
                            className="lab-action-btn"
                            disabled={updatingId === order._id}
                            onClick={() => handleCollectSample(order._id)}
                          >
                            {updatingId === order._id
                              ? "Updating..."
                              : "Collect sample"}
                          </button>
                        )}

                        <Link
                          to={`/laboratory/orders/${order._id}`}
                          className="lab-view-link"
                          title="View order"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredOrders.length > 0 && (
          <div className="lab-table-footer">
            Showing {filteredOrders.length} order(s)
          </div>
        )}
      </section>
    </div>
  );
}
