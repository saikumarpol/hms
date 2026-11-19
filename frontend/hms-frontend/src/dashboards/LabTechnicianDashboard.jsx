
import { useEffect, useState } from "react";
import {
  FlaskConical,
  ClipboardList,
  TestTube,
  CheckCircle2,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

export default function LabTechnicianDashboard() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get("/laboratory/orders")
      .then((response) => {
        if (active) {
          const data = response.data?.data || [];
          setOrders(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Laboratory dashboard error:", error);
        if (active) setOrders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const requested = orders.filter(
    (order) => order.status === "requested"
  ).length;

  const processing = orders.filter(
    (order) =>
      order.status === "sample_collected" ||
      order.status === "processing"
  ).length;

  const completed = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return (
    <DashboardShell
      user={user}
      title="Laboratory Dashboard"
      subtitle="Manage test orders, sample collection and laboratory results."
      greeting="Laboratory workspace"
      stats={[
        {
          title: "Total Orders",
          value: loading ? "..." : orders.length,
          icon: ClipboardList,
          color: "blue",
          note: "Laboratory orders",
        },
        {
          title: "Pending Collection",
          value: loading ? "..." : requested,
          icon: TestTube,
          color: "orange",
          note: "Samples to collect",
        },
        {
          title: "Processing",
          value: loading ? "..." : processing,
          icon: FlaskConical,
          color: "purple",
          note: "Orders in progress",
        },
        {
          title: "Completed",
          value: loading ? "..." : completed,
          icon: CheckCircle2,
          color: "green",
          note: "Completed reports",
        },
      ]}
      actions={[
        {
          title: "Laboratory Orders",
          description: "View pending and completed orders",
          path: "/laboratory",
          icon: ClipboardList,
          color: "blue",
        },
      ]}
    />
  );
}
