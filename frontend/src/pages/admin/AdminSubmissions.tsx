import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { submissionsAPI } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";

const stageLabels: Record<string, string> = { department: "Department", faculty: "School Faculty", board: "Postgrad Board" };
const typeIcons: Record<string, string> = { proposal: "📋", result: "📊", presentation: "📑", publication: "📰" };

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ stage: "department", status: "approved", score: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const fetchSubs = () => {
    submissionsAPI.getAll()
      .then(r => setSubmissions(r.data.submissions))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubs(); }, []);

  const openReview = (sub: any) => {
    setReviewing(sub);
    setReviewForm({ stage: sub.currentStage, status: "approved", score: sub.score?.toString() || "", comment: "" });
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submissionsAPI.review(reviewing.id, {
        stage: reviewForm.stage,
        status: reviewForm.status,
        score: reviewForm.score ? parseFloat(reviewForm.score) : null,
        comment: reviewForm.comment || null,
      });
      addToast("Review submitted. Student has been notified.", "success");
      setReviewing(null);
      fetchSubs();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Review failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = submissions.filter(s => {
    if (!filter) return true;
    return s.status === filter;
  });

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h2>Submissions</h2>
          <div className="page-header-sub">Review and score student submissions</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
          {["", "pending", "approved", "revision", "rejected"].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f)}>
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="empty-state"><div className="spinner dark" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📁</div><div className="empty-text">No submissions found</div></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Title</th><th>Type</th><th>Stage</th><th>Score</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(sub => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{sub.student?.fullName || "Unknown"}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sub.student?.regNumber}</div>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{new Date(sub.submittedAt).toLocaleDateString()}</div>
                      </td>
                      <td><span style={{ fontSize: "1rem" }}>{typeIcons[sub.type] || "📄"}</span> {sub.type}</td>
                      <td><span style={{ fontSize: "0.82rem" }}>{stageLabels[sub.currentStage] || sub.currentStage}</span></td>
                      <td>{sub.score !== null && sub.score !== undefined ? <span style={{ fontWeight: 600, color: "var(--gold)" }}>{sub.score}/100</span> : "—"}</td>
                      <td><span className={`badge badge-${sub.status}`}>{sub.status}</span></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openReview(sub)}>Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewing(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <h3>Review Submission</h3>
            <div style={{ background: "var(--cream)", borderRadius: "var(--radius)", padding: "0.8rem 1rem", marginBottom: "1.2rem" }}>
              <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 4 }}>{reviewing.title}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {reviewing.student?.fullName} · {reviewing.type} · Currently at {stageLabels[reviewing.currentStage]}
              </div>
              {reviewing.description && (
                <div style={{ fontSize: "0.82rem", color: "var(--text-mid)", marginTop: "0.6rem", lineHeight: 1.5 }}>{reviewing.description.slice(0, 200)}{reviewing.description.length > 200 ? "..." : ""}</div>
              )}
              {reviewing.fileUrl && (
                <a href={reviewing.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: "0.6rem", display: "inline-flex" }}>📎 View File</a>
              )}
            </div>

            <form onSubmit={handleReview}>
              <div className="form-row">
                <div className="form-group">
                  <label>Review Stage</label>
                  <select className="form-control" value={reviewForm.stage} onChange={e => setReviewForm(p => ({ ...p, stage: e.target.value }))}>
                    <option value="department">Department</option>
                    <option value="faculty">School Faculty</option>
                    <option value="board">Postgrad Board</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Decision</label>
                  <select className="form-control" value={reviewForm.status} onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="approved">Approve ✅</option>
                    <option value="revision">Request Revision ✏️</option>
                    <option value="rejected">Reject ❌</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Score (0–100, optional)</label>
                <input className="form-control" type="number" min="0" max="100" step="0.1" value={reviewForm.score} onChange={e => setReviewForm(p => ({ ...p, score: e.target.value }))} placeholder="e.g. 85" />
              </div>
              <div className="form-group">
                <label>Feedback / Comments</label>
                <textarea className="form-control" value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="Provide constructive feedback for the student..." rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setReviewing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner" />&nbsp;Submitting...</> : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
