
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Users, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = async (query = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patients", {
        params: query ? { search: query } : {},
      });
      setPatients(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search.trim());
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <h1>Patient records</h1>
          <p>View and manage all registered patients.</p>
        </div>
        <Link to="/patients/new" className="primary-btn">
          <Plus size={18} /> Register patient
        </Link>
      </div>

      <div className="panel">
        <form className="table-toolbar" onSubmit={handleSearch}>
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or UHID..."
            />
          </div>
          <button className="secondary-btn" type="submit">Search</button>
          <button
            className="icon-btn refresh-btn"
            type="button"
            onClick={() => { setSearch(""); fetchPatients(); }}
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>
          <span className="result-count">{patients.length} records</span>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>UHID</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Blood group</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="table-empty">Loading patients...</td></tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <Users size={25} />
                    <p>No patients found.</p>
                  </td>
                </tr>
              ) : patients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="table-person">
                      <div className="avatar patient-avatar">
                        {patient.firstName?.charAt(0)?.toUpperCase()}
                      </div>
                      <strong>{patient.firstName} {patient.lastName}</strong>
                    </div>
                  </td>
                  <td><span className="uhid">{patient.uhid}</span></td>
                  <td className="capitalize">{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.bloodGroup || "—"}</td>
                  <td>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <Link
                      to={`/patients/${patient._id}`}
                      className="row-action"
                      title="View patient"
                    >
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
