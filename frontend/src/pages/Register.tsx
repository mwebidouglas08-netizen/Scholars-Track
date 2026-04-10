import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", regNumber: "",
    level: "", department: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        regNumber: form.regNumber,
        level: form.level,
        department: form.department,
        password: form.password,
      });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>
      {/* Left visual */}
      <div style={{ flex: "0 0 420px", background: "var(--navy)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(201,146,42,0.08)", top: -120, left: -120, pointerEvents: "none" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: "2rem" }}>
            <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 20 }}>S</div>
            <div className="brand-name" style={{ fontSize: "1.3rem" }}>ScholarsTrack</div>
          </Link>
          <div style={{ width: 70, height: 70, background: "rgba(201,146,42,0.14)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.4rem", border: "1px solid rgba(201,146,42,0.25)" }}>📋</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.7rem", marginBottom: "0.6rem" }}>Create Account</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 260, margin: "0 auto" }}>Join ScholarsTrack and start managing your research progress today.</p>
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", textAlign: "left" }}>
            {["Submit proposals, results & presentations", "Track progress at every review stage", "Receive real-time feedback & scores", "Message your academic moderator"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", flexShrink: 0, display: "block" }} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 3rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 540, width: "100%", margin: "0 auto" }}>
          <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "inline-block", marginBottom: "1.5rem" }}>← Back to home</Link>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--navy)", marginBottom: "0.3rem" }}>Student Registration</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.8rem" }}>Fill in your details to create your account</p>

          {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="e.g. Amara Osei" required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@university.edu" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone / WhatsApp *</label>
                <input className="form-control" type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+254 7XX XXX XXX" required />
              </div>
              <div className="form-group">
                <label>Registration Number *</label>
                <input className="form-control" value={form.regNumber} onChange={e => update("regNumber", e.target.value)} placeholder="e.g. PG/2024/0142" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Academic Level *</label>
                <select className="form-control" value={form.level} onChange={e => update("level", e.target.value)} required>
                  <option value="">— Select level —</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD / Doctorate</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <input className="form-control" value={form.department} onChange={e => update("department", e.target.value)} placeholder="e.g. Computer Science" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input className="form-control" type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Minimum 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input className="form-control" type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }} disabled={loading}>
              {loading ? <><span className="spinner" />&nbsp;Creating account...</> : "Create My Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--navy)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
