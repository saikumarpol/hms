
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CalendarPlus,
  CalendarDays,
  Search,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [patientCount, setPatientCount] = useState("...");
  
  useEffect(() => {
    let active = true;

    api.get("/patients")
      .then((response) => {
        if (active) {
          const patients = response.data?.data || [];
          setPatientCount(Array.isArray(patients) ? patients.length : 0);
        }
      })
      .catch((error) => {
        console.error("Patient dashboard error:", error);
        if (active) setPatientCount("—");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell
      user={user}
      title="Receptionist Dashboard"
      subtitle="Manage front desk operations, patient registrations and appointments."
      greeting="Front desk workspace"
      stats={[
        {
          title: "Registered Patients",
          value: patientCount,
          icon: Users,
          color: "blue",
          note: "Patient records available",
        },
      ]}
      actions={[
        {
          title: "Register Patient",
          description: "Create a new patient record",
          path: "/patients/new",
          icon: UserPlus,
          color: "blue",
        },
        {
          title: "Patient Records",
          description: "Search and view patients",
          path: "/patients",
          icon: Search,
          color: "green",
        },
        {
          title: "Book Appointment",
          description: "Schedule a doctor appointment",
          path: "/appointments/new",
          icon: CalendarPlus,
          color: "orange",
        },
        {
          title: "Appointments",
          description: "View appointment schedules",
          path: "/appointments",
          icon: CalendarDays,
          color: "purple",
        },
      ]}
    />
  );
}
