
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  TestTube2,
  AlertCircle,
  CheckCircle2,
  X,
  FlaskConical,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getLabTests,
  createLabTest,
  updateLabTest,
} from "../../services/laboratoryService";

import "./lab-tests.css";

const EMPTY_FORM = {
  code: "",
  name: "",
  category: "",
  specimen: "",
  description: "",
  price: "",
  turnaroundHours: "6",
  parameters: [
    {
      name: "",
      unit: "",
      referenceRange: "",
      resultType: "number",
    },
  ],
};

const getError = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

export default function LabTests() {
  const { user } = useAuth();

  const canManage = ["super_admin", "admin"].includes(user?.role);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (search.trim()) filters.search = search.trim();
      if (category) filters.category = category;

      // Backend currently returns active tests by default.
      // Inactive tests can be fetched by admin only if backend supports it.
      const data = await getLabTests(filters);

      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const categories = [
    ...new Set(tests.map((test) => test.category).filter(Boolean)),
  ];

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      parameters: [{ ...EMPTY_FORM.parameters[0] }],
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingId(test._id);

    setForm({
      code: test.code || "",
      name: test.name || "",
      category: test.category || "",
      specimen: test.specimen || "",
      description: test.description || "",
      price: String(test.price ?? ""),
      turnaroundHours: String(test.turnaroundHours ?? 6),
      parameters: test.parameters?.length
        ? test.parameters.map((parameter) => ({
            name: parameter.name || "",
            unit: parameter.unit || "",
            referenceRange: parameter.referenceRange || "",
            resultType: parameter.resultType || "number",
          }))
        : [{ ...EMPTY_FORM.parameters[0] }],
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateParameter = (index, field, value) => {
    setForm((current) => ({
      ...current,
      parameters: current.parameters.map((parameter, i) =>
        i === index ? { ...parameter, [field]: value } : parameter
      ),
    }));
  };

  const addParameter = () => {
    setForm((current) => ({
      ...current,
      parameters: [
        ...current.parameters,
        {
          name: "",
          unit: "",
          referenceRange: "",
          resultType: "number",
        },
      ],
    }));
  };

  const removeParameter = (index) => {
    setForm((current) => ({
      ...current,
      parameters: current.parameters.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        category: form.category.trim(),
        specimen: form.specimen.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        turnaroundHours: Number(form.turnaroundHours),
        parameters: form.parameters.map((parameter) => ({
          name: parameter.name.trim(),
          unit: parameter.unit.trim(),
          referenceRange: parameter.referenceRange.trim(),
          resultType: parameter.resultType,
        })),
      };

      if (editingId) {
        await updateLabTest(editingId, payload);
        setSuccess("Laboratory test updated successfully.");
      } else {
        await createLabTest(payload);
        setSuccess("Laboratory test created successfully.");
      }

      setModalOpen(false);
      await loadTests();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (test) => {
    try {
      setError("");
      setSuccess("");

      await updateLabTest(test._id, {
        isActive: !test.isActive,
      });

      setSuccess(
        test.isActive
          ? "Test deactivated successfully."
          : "Test activated successfully."
      );

      await loadTests();
    } catch (err) {
      setError(getError(err));
    }
  };

  const visibleTests = tests.filter((test) =>
    showInactive ? true : test.isActive !== false
  );

  return (
    <div className="lab-tests-page">
      <div className="lab-tests-heading">
        <div>
          <span className="eyebrow">LABORATORY CONFIGURATION</span>
          <h1>Test Catalogue</h1>
          <p>Manage laboratory tests, parameters, pricing and specimens.</p>
        </div>

        {canManage && (
          <button className="lab-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            Add New Test
          </button>
        )}
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

      <section className="lab-tests-panel">
        <div className="lab-tests-toolbar">
          <div>
            <h2>Available laboratory tests</h2>
            <p>{tests.length} test(s) loaded from the catalogue</p>
          </div>

          <button
            type="button"
            className="lab-icon-button"
            onClick={loadTests}
            title="Refresh catalogue"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="lab-tests-filters">
          <div className="lab-tests-search">
            <Search size={17} />
            <input
              placeholder="Search test name, code or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="lab-filter-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          {canManage && (
            <label className="lab-inactive-toggle">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
              />
              Show inactive
            </label>
          )}
        </div>

        <div className="lab-tests-table-wrap">
          {loading ? (
            <div className="lab-empty">
              <RefreshCw className="spin" size={24} />
              <p>Loading test catalogue...</p>
            </div>
          ) : visibleTests.length === 0 ? (
            <div className="lab-empty">
              <FlaskConical size={34} />
              <h3>No laboratory tests found</h3>
              <p>Try another search or add a new test.</p>
            </div>
          ) : (
            <table className="lab-tests-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Specimen</th>
                  <th>Parameters</th>
                  <th>Price</th>
                  <th>Turnaround</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {visibleTests.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <div className="lab-test-title">
                        <strong>{test.name}</strong>
                        <small>{test.code}</small>
                      </div>
                    </td>

                    <td>{test.category || "—"}</td>
                    <td>{test.specimen || "—"}</td>
                    <td>{test.parameters?.length || 0} parameters</td>
                    <td>₹{Number(test.price || 0).toLocaleString("en-IN")}</td>
                    <td>{test.turnaroundHours ?? "—"} hours</td>

                    <td>
                      <span
                        className={`lab-test-active ${
                          test.isActive ? "active" : "inactive"
                        }`}
                      >
                        {test.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        <div className="lab-test-actions">
                          <button
                            type="button"
                            className="lab-test-edit"
                            onClick={() => openEditModal(test)}
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="lab-test-toggle"
                            onClick={() => handleToggleActive(test)}
                          >
                            {test.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="lab-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="lab-test-modal">
            <div className="lab-modal-heading">
              <div>
                <h2>{editingId ? "Edit Laboratory Test" : "Add Laboratory Test"}</h2>
                <p>Enter test details and result parameters.</p>
              </div>

              <button
                type="button"
                className="lab-modal-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="lab-modal-body">
                <div className="lab-form-grid">
                  <label>
                    Test Code *
                    <input
                      required
                      value={form.code}
                      onChange={(event) => updateField("code", event.target.value)}
                      placeholder="e.g. CBC"
                    />
                  </label>

                  <label>
                    Test Name *
                    <input
                      required
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="Complete Blood Count"
                    />
                  </label>

                  <label>
                    Category *
                    <input
                      required
                      value={form.category}
                      onChange={(event) => updateField("category", event.target.value)}
                      placeholder="Hematology"
                    />
                  </label>

                  <label>
                    Specimen *
                    <input
                      required
                      value={form.specimen}
                      onChange={(event) => updateField("specimen", event.target.value)}
                      placeholder="Whole Blood"
                    />
                  </label>

                  <label>
                    Price (₹) *
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => updateField("price", event.target.value)}
                      placeholder="500"
                    />
                  </label>

                  <label>
                    Turnaround time (hours) *
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.turnaroundHours}
                      onChange={(event) => updateField("turnaroundHours", event.target.value)}
                    />
                  </label>
                </div>

                <label className="lab-description-field">
                  Description
                  <textarea
                    rows="2"
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Brief test description..."
                  />
                </label>

                <div className="lab-parameters-heading">
                  <div>
                    <h3>Test parameters</h3>
                    <p>Define the values that the technician must enter.</p>
                  </div>

                  <button
                    type="button"
                    className="lab-add-parameter"
                    onClick={addParameter}
                  >
                    <Plus size={15} />
                    Add parameter
                  </button>
                </div>

                {form.parameters.map((parameter, index) => (
                  <div className="lab-parameter-row" key={index}>
                    <label>
                      Parameter name *
                      <input
                        required
                        value={parameter.name}
                        onChange={(event) =>
                          updateParameter(index, "name", event.target.value)
                        }
                        placeholder="Hemoglobin"
                      />
                    </label>

                    <label>
                      Unit
                      <input
                        value={parameter.unit}
                        onChange={(event) =>
                          updateParameter(index, "unit", event.target.value)
                        }
                        placeholder="g/dL"
                      />
                    </label>

                    <label>
                      Reference range
                      <input
                        value={parameter.referenceRange}
                        onChange={(event) =>
                          updateParameter(index, "referenceRange", event.target.value)
                        }
                        placeholder="13.0-17.0"
                      />
                    </label>

                    <label>
                      Result type
                      <select
                        value={parameter.resultType}
                        onChange={(event) =>
                          updateParameter(index, "resultType", event.target.value)
                        }
                      >
                        <option value="number">Number</option>
                        <option value="text">Text</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="lab-remove-parameter"
                      onClick={() => removeParameter(index)}
                      disabled={form.parameters.length === 1}
                      title="Remove parameter"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="lab-modal-footer">
                <button
                  type="button"
                  className="lab-cancel-btn"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="lab-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
