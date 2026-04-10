import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(99,102,241,0.08)", top: -200, right: -200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(99,102,241,0.05)", bottom: -100, left: -100, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, background: "rgba(99,102,241,0.18)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", margin: "0 auto 1rem", border: "1px solid rgba(99,102,241,0.3)" }}>🛡️</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: "0.5rem" }}>
            <div className="brand-icon" style={{ background: "#6366f1", fontSize: 15, width: 30, height: 30 }}>S</div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem" }}>ScholarsTrack</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.6rem", marginBottom: "0.3rem" }}>Admin Portal</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>Authorized personnel only</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "2rem" }}>
          {error && (
            <div style={{ background: "rgba(181,42,42,0.15)", border: "1px solid rgba(181,42,42,0.3)", color: "#ff9999", padding: "10px 14px", borderRadius: 8, marginBottom: "1.2rem", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: "rgba(255,255,255,0.6)" }}>Admin Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@scholarstrack.edu"
                required
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "white" }}
              />
            </div>
            <div className="form-group">
              <label style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "white" }}
              />
            </div>
            <button type="submit" className="btn btn-lg" style={{ width: "100%", justifyContent: "center", background: "#6366f1", color: "white", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? <><span className="spinner" />&nbsp;Authenticating...</> : "Access Admin Panel"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.82rem" }}>
          <Link to="/login" style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.15s" }}>← Student login</Link>
        </p>

        <div style={{ marginTop: "2rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Default Admin Credentials</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>Email: <strong style={{ color: "#a5b4fc" }}>admin@scholarstrack.edu</strong></div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginTop: 3 }}>Password: <strong style={{ color: "#a5b4fc" }}>Admin@ScholarsTrack2024</strong></div>
        </div>
      </div>
    </div>
  );
}
