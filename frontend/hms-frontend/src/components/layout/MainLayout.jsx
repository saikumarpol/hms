
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className={menuOpen ? "sidebar-wrap mobile-open" : "sidebar-wrap"}>
        <Sidebar />
      </div>

      <main className="main-area">
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
        <div className="page-content" onClick={() => menuOpen && setMenuOpen(false)}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
