import React, { useEffect, useState } from "react";
import StudentLayout from "../components/StudentLayout";
import { submissionsAPI } from "../lib/api";

const stageLabels: Record<string, string> = {
  department: "Department Level",
  faculty: "School Faculty",
  board: "Postgraduate Board",
};

const stageDescs: Record<string, string> = {
  department: "Initial review by your department committee",
  faculty: "Faculty-level evaluation and scoring",
  board: "Final approval by the postgraduate board",
};

export default function Progress() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI.getProgress()
      .then(r => setProgress(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-page"><div className="spinner dark" /></div>
      </StudentLayout>
    );
  }

  const scores = progress?.scores || {};
  const stageStatus = progress?.stageStatus || {};
  const overall = progress?.overallScore || 0;

  const types = [
    { key: "proposal", label: "Proposal", weight: "35%" },
    { key: "result", label: "Result", weight: "30%" },
    { key: "presentation", label: "Presentation", weight: "20%" },
    { key: "publication", label: "Publication", weight: "15%" },
  ];

  const scoreColor = (s: number | null) => {
    if (s === null) return "var(--border)";
    if (s >= 70) return "var(--success)";
    if (s >= 50) return "var(--gold)";
    return "var(--danger)";
  };

  return (
    <StudentLayout>
      <div className="page-header">
        <div>
          <h2>My Progress</h2>
          <div className="page-header-sub">Track your research journey through each review level.</div>
        </div>
      </div>

      <div className="page-body">
        {/* Overall Score */}
        <div className="card" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `4px solid ${scoreColor(overall)}`, background: overall === 0 ? "#f9f9f7" : `${scoreColor(overall)}15` }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: scoreColor(overall) }}>{overall.toFixed(1)}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Overall Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
              {types.map(t => (
                <div key={t.key} style={{ textAlign: "center", padding: "0.8rem", background: "var(--cream)", borderRadius: "var(--radius)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 600, color: scores[t.key] !== null ? scoreColor(scores[t.key]) : "var(--text-muted)" }}>
                    {scores[t.key] !== null && scores[t.key] !== undefined ? scores[t.key].toFixed(1) : "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{t.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>weight: {t.weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1.2rem" }}>Score Breakdown</div>
          {types.map(t => (
            <div key={t.key} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-mid)" }}>{t.label}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: scoreColor(scores[t.key]) }}>
                  {scores[t.key] !== null && scores[t.key] !== undefined ? `${scores[t.key].toFixed(1)}/100` : "0.0/100"}
                </span>
              </div>
              <div className="score-bar-track">
                <div className={`score-bar-fill ${scores[t.key] >= 70 ? "high" : scores[t.key] < 50 && scores[t.key] !== null ? "low" : ""}`}
                  style={{ width: `${scores[t.key] || 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Review Pipeline */}
        <div className="card">
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1.2rem" }}>Review Pipeline</div>
          {["department", "faculty", "board"].map((stage, i) => {
            const status = stageStatus[stage] || "not_started";
            const statusLabels: Record<string, string> = {
              approved: "Approved",
              pending: "In Review",
              revision: "Needs Revision",
              rejected: "Rejected",
              not_started: "Not Started",
            };
            const dotColor: Record<string, string> = {
              approved: "var(--success)",
              pending: "var(--gold)",
              revision: "var(--info)",
              rejected: "var(--danger)",
              not_started: "var(--border)",
            };
            return (
              <div key={stage} style={{ display: "flex", alignItems: "center", padding: "1rem 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor[status], flexShrink: 0, marginRight: 14 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-dark)" }}>{stageLabels[stage]}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{stageDescs[stage]}</div>
                </div>
                <span className={`badge badge-${status}`}>{statusLabels[status]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}
