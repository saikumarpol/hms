
import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  UserCog,
  CalendarDays,
  Plus,
  FlaskConical,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

const getList = (response) =>
  Array.isArray(response?.data?.data) ? response.data.data : [];

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const [counts, setCounts] = useState({
    patients: 0,
    doctors: 0,
    staff: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const results = await Promise.allSettled([
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/users"),
      ]);

      if (!active) return;

      setCounts({
        patients: results[0].status === "fulfilled"
          ? getList(results[0].value).length
          : 0,

        doctors: results[1].status === "fulfilled"
          ? getList(results[1].value).length
          : 0,

        staff: results[2].status === "fulfilled"
          ? getList(results[2].value).length
          : 0,
      });

      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell
      user={user}
      title="Super Admin Dashboard"
      subtitle="Manage hospital users, departments and daily operations."
      greeting="Hospital overview"
      stats={[
        {
          title: "Total Patients",
          value: loading ? "..." : counts.patients,
          icon: Users,
          color: "blue",
          note: "Registered patient records",
        },
        {
          title: "Doctor Profiles",
          value: loading ? "..." : counts.doctors,
          icon: Stethoscope,
          color: "green",
          note: "Registered doctors",
        },
        {
          title: "User Accounts",
          value: loading ? "..." : counts.staff,
          icon: UserCog,
          color: "purple",
          note: "Hospital login accounts",
        },
      ]}
      actions={[
        {
          title: "User Management",
          description: "Create and view staff accounts",
          path: "/users",
          icon: UserCog,
          color: "blue",
        },
        {
          title: "Register Patient",
          description: "Add a new patient",
          path: "/patients/new",
          icon: Plus,
          color: "green",
        },
        {
          title: "Appointments",
          description: "View hospital appointments",
          path: "/appointments",
          icon: CalendarDays,
          color: "orange",
        },
        {
          title: "Laboratory",
          description: "Review laboratory operations",
          path: "/laboratory",
          icon: FlaskConical,
          color: "purple",
        },
      ]}
    />
  );
}
