import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { notificationsAPI, messagesAPI } from "../lib/api";

interface LayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    notificationsAPI.getUnreadCount().then(r => setNotifCount(r.data.count)).catch(() => {});
    messagesAPI.getUnreadCount().then(r => setMsgCount(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      notificationsAPI.getUnreadCount().then(r => setNotifCount(r.data.count)).catch(() => {});
      messagesAPI.getUnreadCount().then(r => setMsgCount(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "ST";

  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/dashboard/progress", icon: "📈", label: "My Progress" },
    { path: "/dashboard/submissions", icon: "📤", label: "Submissions" },
    { path: "/dashboard/new-submission", icon: "➕", label: "New Submission" },
    { path: "/dashboard/notifications", icon: "🔔", label: "Notifications", badge: notifCount },
    { path: "/dashboard/messages", icon: "💬", label: "Messages", badge: msgCount },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">S</div>
            <div>
              <div className="brand-name">ScholarsTrack</div>
              <div className="brand-tagline">PostGrad Tracker</div>
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.fullName || "Student"}</div>
            <div className="user-sub">{user?.regNumber}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Student Portal</div>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: "0.5rem 0.8rem", marginBottom: "0.4rem" }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>Level</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 500 }}>
              {user?.level === "bachelor" ? "Bachelor's" : user?.level === "masters" ? "Master's" : user?.level === "phd" ? "PhD" : user?.level}
            </div>
          </div>
          <button className="btn-signout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
