
import { Bell, Search, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

const titles = {
  "/": ["Dashboard", "Overview of your hospital operations"],
  "/patients": ["Patients", "Manage patient records and registration"],
  "/doctors": ["Doctors", "Manage your medical professionals"],
  "/appointments": ["Appointments", "Manage doctor appointments"],
  "/consultations": ["Consultations", "Patient consultations and diagnosis"],
  "/laboratory": ["Laboratory", "Manage lab requests and reports"],
  "/pharmacy": ["Pharmacy", "Manage medicines and dispensing"],
  "/billing": ["Billing", "Manage invoices and payments"],
  "/settings": ["Settings", "Manage workspace settings"],
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const [title, subtitle] = titles[location.pathname] || ["HMS", "Hospital workspace"];

  return (
    <header className="top-header">
      <button className="mobile-menu" onClick={onMenuClick}>
        <Menu size={21} />
      </button>

      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="header-search">
          <Search size={17} />
          <span>Search workspace</span>
          <kbd>⌘ K</kbd>
        </div>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={19} />
          <i />
        </button>
      </div>
    </header>
  );
}
