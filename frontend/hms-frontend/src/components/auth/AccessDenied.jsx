
import { LockKeyhole, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AccessDenied() {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "65vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          padding: 32,
          background: "#fff",
          border: "1px solid #e8edf4",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "#fef2f2",
            color: "#dc2626",
            display: "grid",
            placeItems: "center",
          }}
        >
          <LockKeyhole size={30} />
        </div>

        <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700 }}>
          403 · ACCESS DENIED
        </span>

        <h2 style={{ color: "#172b4d", margin: "12px 0" }}>
          You don't have permission
        </h2>

        <p style={{ color: "#718096", fontSize: 13, lineHeight: 1.7 }}>
          Your account cannot access this module. Contact your hospital
          administrator if you need access.
        </p>

        <p style={{ color: "#94a3b8", fontSize: 11, margin: "15px 0 22px" }}>
          Requested page: {location.pathname}
        </p>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 17px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
