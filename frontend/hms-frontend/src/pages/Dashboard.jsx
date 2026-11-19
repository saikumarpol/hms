
import { useAuth } from "../context/AuthContext";

import SuperAdminDashboard from "../dashboards/SuperAdminDashboard";
import ReceptionistDashboard from "../dashboards/ReceptionistDashboard";
import DoctorDashboard from "../dashboards/DoctorDashboard";
import LabTechnicianDashboard from "../dashboards/LabTechnicianDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "super_admin":
      return <SuperAdminDashboard />;

    case "receptionist":
      return <ReceptionistDashboard />;

    case "doctor":
      return <DoctorDashboard />;

    case "lab_technician":
      return <LabTechnicianDashboard />;

    default:
      return (
        <div className="panel" style={{ padding: 30 }}>
          <h2>Dashboard unavailable</h2>
          <p>
            Your account role is not included in the current HMS demo.
            Please contact the Super Admin.
          </p>
        </div>
      );
  }
}
