
import {
  CalendarDays,
  ClipboardPlus,
  Users,
  FlaskConical,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

export default function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell
      user={user}
      title="Doctor Dashboard"
      subtitle="Manage your appointments, patient consultations and laboratory requests."
      greeting="Clinical workspace"
      stats={[
        {
          title: "Clinical Access",
          value: "Active",
          icon: ClipboardPlus,
          color: "green",
          note: "Consultation workspace",
        },
        {
          title: "Lab Access",
          value: "Active",
          icon: FlaskConical,
          color: "blue",
          note: "Test requests and reports",
        },
      ]}
      actions={[
        {
          title: "My Appointments",
          description: "View your appointment schedule",
          path: "/appointments",
          icon: CalendarDays,
          color: "blue",
        },
        {
          title: "Consultations",
          description: "Start and manage consultations",
          path: "/consultations",
          icon: ClipboardPlus,
          color: "green",
        },
        {
          title: "Patient Records",
          description: "View authorized patient records",
          path: "/patients",
          icon: Users,
          color: "orange",
        },
        {
          title: "Laboratory",
          description: "Request tests and review reports",
          path: "/laboratory",
          icon: FlaskConical,
          color: "purple",
        },
      ]}
    />
  );
}
