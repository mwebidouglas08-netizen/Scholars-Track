import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { submissionsAPI } from "../lib/api";

const stageLabels: Record<string, string> = {
  department: "Department",
  faculty: "School Faculty",
  board: "Postgrad Board",
};

const typeIcons: Record<string, string> = {
  proposal: "📋", result: "📊", presentation: "📑", publication: "📰",
};

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    submissionsAPI.getMy()
      .then(r => setSubmissions(r.data.submissions))
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

  return (
    <StudentLayout>
      <div className="page-header">
        <div>
          <h2>My Submissions</h2>
          <div className="page-header-sub">{submissions.length} submission{submissions.length !== 1 ? "s" : ""} total</div>
        </div>
        <button className="btn btn-gold" onClick={() => navigate("/dashboard/new-submission")}>+ New Submission</button>
      </div>

      <div className="page-body">
        {submissions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <div className="empty-text">You haven't made any submissions yet.</div>
              <button className="btn btn-gold" style={{ marginTop: "1rem" }} onClick={() => navigate("/dashboard/new-submission")}>
                Make Your First Submission
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {submissions.map((sub) => (
              <div key={sub.id} className="card" style={{ cursor: "pointer", transition: "box-shadow 0.15s" }}
                onClick={() => setSelected(selected?.id === sub.id ? null : sub)}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "1.6rem" }}>{typeIcons[sub.type] || "📄"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.95rem" }}>{sub.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 3 }}>
                      {sub.type.charAt(0).toUpperCase() + sub.type.slice(1)} · {stageLabels[sub.currentStage]} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    {sub.score !== null && sub.score !== undefined && (
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--gold)" }}>{sub.score}/100</span>
                    )}
                    <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === sub.id && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-mid)", marginBottom: "1rem" }}>{sub.description}</div>

                    {sub.reviewerComment && (
                      <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
                        <div><strong>Reviewer Feedback:</strong> {sub.reviewerComment}</div>
                      </div>
                    )}

                    {sub.fileUrl && (
                      <div style={{ marginBottom: "1rem" }}>
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">📎 View File</a>
                      </div>
                    )}

                    {/* Stage reviews */}
                    {sub.stageReviews && sub.stageReviews.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>Stage Reviews</div>
                        {sub.stageReviews.map((r: any) => (
                          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.status === "approved" ? "var(--success)" : r.status === "pending" ? "var(--gold)" : "var(--danger)", display: "block", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.82rem", flex: 1 }}>{stageLabels[r.stage] || r.stage}</span>
                            <span className={`badge badge-${r.status}`}>{r.status}</span>
                            {r.score && <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--gold)" }}>{r.score}/100</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
