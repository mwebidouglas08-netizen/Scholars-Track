import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminAPI } from "../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminLayout><div className="loading-page"><div className="spinner dark" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h2>System Overview</h2>
          <div className="page-header-sub">ScholarsTrack — Graduate Research Management</div>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card gold"><div className="stat-label">Total Students</div><div className="stat-num">{stats?.totalStudents || 0}</div><div className="stat-sub">Registered students</div></div>
          <div className="stat-card info"><div className="stat-label">Total Submissions</div><div className="stat-num">{stats?.totalSubmissions || 0}</div><div className="stat-sub">{stats?.pendingReviews || 0} pending review</div></div>
          <div className="stat-card success"><div className="stat-label">Approved</div><div className="stat-num">{stats?.approvedSubmissions || 0}</div><div className="stat-sub">Submissions approved</div></div>
          <div className="stat-card purple"><div className="stat-label">Avg. Score</div><div className="stat-num">{stats?.avgScore || 0}</div><div className="stat-sub">System-wide average</div></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* By level */}
          <div className="card">
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>📊 Students by Level</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", background: "var(--success-bg)", borderRadius: "var(--radius)" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--success)", fontWeight: 600 }}>{stats?.byLevel?.bachelor || 0}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--success)", marginTop: 3 }}>Bachelor's</div>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", background: "var(--info-bg)", borderRadius: "var(--radius)" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--info)", fontWeight: 600 }}>{stats?.byLevel?.masters || 0}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--info)", marginTop: 3 }}>Master's</div>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", background: "var(--purple-bg)", borderRadius: "var(--radius)" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--purple)", fontWeight: 600 }}>{stats?.byLevel?.phd || 0}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--purple)", marginTop: 3 }}>PhD</div>
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="card">
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>⚡ System Info</div>
            {[
              ["Admin Users", stats?.totalAdmins || 0],
              ["Pending Reviews", stats?.pendingReviews || 0],
              ["Unread Messages", stats?.unreadMessages || 0],
            ].map(([label, val]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-mid)" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "var(--navy)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
