import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { useAuth } from "../hooks/useAuth";
import { submissionsAPI, notificationsAPI } from "../lib/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      submissionsAPI.getProgress(),
      submissionsAPI.getMy(),
      notificationsAPI.getMy(),
    ]).then(([prog, subs, notifs]) => {
      setProgress(prog.data);
      setSubmissions(subs.data.submissions);
      setNotifications(notifs.data.notifications.slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const levelLabel = (l: string) => ({ bachelor: "Bachelor's", masters: "Master's", phd: "PhD" }[l] || l);

  const stageOrder = ["department", "faculty", "board"];
  const stageLabels: Record<string, string> = { department: "Department", faculty: "School Faculty", board: "Postgrad Board" };

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-page" style={{ minHeight: "100vh" }}><div className="spinner dark" /></div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.fullName?.split(" ")[0]} 👋</h2>
          <div className="page-header-sub">{user?.department} · {levelLabel(user?.level || "")}</div>
        </div>
        <div className="score-circle">{progress?.overallScore?.toFixed(1) || "0.0"}</div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card gold">
            <div className="stat-label">Overall Score</div>
            <div className="stat-num">{progress?.overallScore?.toFixed(1) || "0.0"}<span style={{ fontSize: "1rem", fontFamily: "Inter" }}>/100</span></div>
            <div className="stat-sub">Weighted average</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Submissions</div>
            <div className="stat-num">{submissions.length}</div>
            <div className="stat-sub">{submissions.filter(s => s.status === "approved").length} approved</div>
          </div>
          <div className="stat-card info">
            <div className="stat-label">Level</div>
            <div className="stat-num" style={{ fontSize: "1.2rem", marginTop: "0.4rem" }}>{levelLabel(user?.level || "")}</div>
            <div className="stat-sub">{user?.regNumber}</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Current Stage</div>
            <div className="stat-num" style={{ fontSize: "1.1rem", marginTop: "0.4rem" }}>
              {submissions.length > 0 ? stageLabels[submissions[0]?.currentStage] || "—" : "—"}
            </div>
            <div className="stat-sub">Active review stage</div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>📍 Review Pipeline</div>
          <div className="pipeline">
            {stageOrder.map((stage, i) => {
              const status = progress?.stageStatus?.[stage] || "not_started";
              const isDone = status === "approved";
              const isActive = status === "pending" || status === "revision";
              return (
                <React.Fragment key={stage}>
                  <div className="pipeline-step">
                    <div className={`step-circle ${isDone ? "done" : isActive ? "active" : ""}`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div className={`step-text ${isDone ? "done" : isActive ? "active" : ""}`}>{stageLabels[stage]}</div>
                  </div>
                  {i < stageOrder.length - 1 && (
                    <div className={`pipeline-connector ${isDone ? "done" : isActive ? "active" : ""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Recent Submissions */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)" }}>📁 Recent Submissions</div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate("/dashboard/submissions")}>View all</button>
            </div>
            {submissions.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>
                <div className="empty-icon">📄</div>
                <div className="empty-text">No submissions yet</div>
                <button className="btn btn-gold btn-sm" style={{ marginTop: "0.8rem" }} onClick={() => navigate("/dashboard/new-submission")}>Make first submission</button>
              </div>
            ) : (
              submissions.slice(0, 4).map((sub) => (
                <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-dark)" }}>{sub.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{sub.type} · {stageLabels[sub.currentStage]}</div>
                  </div>
                  <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)" }}>🔔 Recent Notifications</div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate("/dashboard/notifications")}>View all</button>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>
                <div className="empty-icon">🔔</div>
                <div className="empty-text">No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item ${!n.isRead ? "unread" : ""}`} style={{ paddingLeft: "0.8rem", paddingRight: 0, paddingTop: "0.6rem", paddingBottom: "0.6rem" }}>
                  {!n.isRead && <div className="notif-dot" style={{ marginTop: 4 }} />}
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-body" style={{ fontSize: "0.78rem" }}>{n.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>⚡ Quick Actions</div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={() => navigate("/dashboard/new-submission")}>📤 New Submission</button>
            <button className="btn btn-outline" onClick={() => navigate("/dashboard/progress")}>📈 View Progress</button>
            <button className="btn btn-outline" onClick={() => navigate("/dashboard/messages")}>💬 Message Moderator</button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
