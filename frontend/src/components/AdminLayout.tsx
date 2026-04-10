import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin/dashboard", icon: "📊", label: "Overview" },
    { path: "/admin/students", icon: "👥", label: "Students" },
    { path: "/admin/submissions", icon: "📁", label: "Submissions" },
    { path: "/admin/notifications", icon: "🔔", label: "Send Notifications" },
    { path: "/admin/messages", icon: "💬", label: "Messages" },
    { path: "/admin/admins", icon: "🔑", label: "Admin Users" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ background: "#111827" }}>
        <div className="sidebar-brand" style={{ borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <div className="brand-logo">
            <div className="brand-icon" style={{ background: "#6366f1" }}>S</div>
            <div>
              <div className="brand-name">ScholarsTrack</div>
              <div className="brand-tagline">Admin Panel</div>
            </div>
          </div>
        </div>

        <div className="sidebar-user" style={{ borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <div className="user-avatar" style={{ borderColor: "#6366f1", color: "#a5b4fc", background: "rgba(99,102,241,0.15)" }}>AD</div>
          <div>
            <div className="user-name">{user?.fullName || "Admin"}</div>
            <div className="user-sub">Administrator</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Management</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              style={{ ...(location.pathname === item.path ? { background: "rgba(99,102,241,0.18)", color: "#a5b4fc" } : {}) }}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ borderTopColor: "rgba(255,255,255,0.06)" }}>
          <button className="btn-signout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
