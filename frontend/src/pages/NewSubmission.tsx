import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { submissionsAPI } from "../lib/api";

const types = [
  { key: "proposal", label: "Research Proposal", icon: "📋", desc: "Submit your initial research proposal for review" },
  { key: "result", label: "Research Results", icon: "📊", desc: "Submit your research findings and data" },
  { key: "presentation", label: "Presentation", icon: "📑", desc: "Submit your presentation slides for defense" },
  { key: "publication", label: "Publication", icon: "📰", desc: "Submit a publication or journal article" },
];

export default function NewSubmission() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [form, setForm] = useState({ title: "", description: "", fileName: "", fileUrl: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) { setError("Please select a submission type"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await submissionsAPI.create({ type: selectedType, ...form });
      setSuccess("Submission created successfully! It has been sent to Department review.");
      setTimeout(() => navigate("/dashboard/submissions"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="page-header">
        <div>
          <h2>New Submission</h2>
          <div className="page-header-sub">Submit your research document for review</div>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Type selection */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>1. Select Submission Type</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.8rem" }}>
              {types.map(t => (
                <div
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  style={{
                    padding: "1rem 1.2rem", borderRadius: "var(--radius)", cursor: "pointer", transition: "all 0.15s",
                    border: selectedType === t.key ? "2px solid var(--gold)" : "1.5px solid var(--border)",
                    background: selectedType === t.key ? "var(--gold-pale)" : "white",
                  }}
                >
                  <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{t.icon}</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.2rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>2. Submission Details</div>
            <div className="form-group">
              <label>Title *</label>
              <input className="form-control" value={form.title} onChange={e => update("title", e.target.value)} placeholder="Enter the title of your submission..." required />
            </div>
            <div className="form-group">
              <label>Abstract / Description *</label>
              <textarea className="form-control" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Provide a detailed description of your submission..." rows={5} required />
            </div>
          </div>

          {/* File */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>3. File Reference (Optional)</div>
            <div className="form-group">
              <label>Google Drive / Dropbox / OneDrive Link</label>
              <input className="form-control" value={form.fileUrl} onChange={e => update("fileUrl", e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
            <div className="form-group">
              <label>File Name</label>
              <input className="form-control" value={form.fileName} onChange={e => update("fileName", e.target.value)} placeholder="e.g. Research_Proposal_v2.pdf" />
            </div>
            <div style={{ background: "var(--info-bg)", border: "1px solid rgba(21,89,160,0.15)", borderRadius: "var(--radius)", padding: "0.8rem 1rem", fontSize: "0.8rem", color: "var(--info)" }}>
              ℹ️ File uploads are supported via external links. Paste a shareable link to your document.
            </div>
          </div>

          {/* Review path */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.8rem" }}>4. Review Path</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Department Review", "→", "School Faculty", "→", "Postgraduate Board", "→", "Final Approval"].map((step, i) => (
                <span key={i} style={{ fontSize: "0.82rem", color: step === "→" ? "var(--text-muted)" : "var(--navy)", fontWeight: step !== "→" ? 500 : 400 }}>{step}</span>
              ))}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>Your submission will automatically progress through each stage upon approval.</div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/dashboard/submissions")}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={loading || !selectedType}>
              {loading ? <><span className="spinner" />&nbsp;Submitting...</> : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
