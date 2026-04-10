import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex" }}>
      {/* Left visual */}
      <div style={{ flex: "0 0 400px", background: "var(--navy)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(201,146,42,0.08)", top: -120, left: -120, pointerEvents: "none" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: "2rem" }}>
            <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 20 }}>S</div>
            <div className="brand-name" style={{ fontSize: "1.3rem" }}>ScholarsTrack</div>
          </Link>
          <div style={{ width: 70, height: 70, background: "rgba(201,146,42,0.14)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.4rem", border: "1px solid rgba(201,146,42,0.25)" }}>🔐</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.7rem", marginBottom: "0.6rem" }}>Welcome Back</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 250, margin: "0 auto 2rem" }}>Sign in to access your research progress dashboard.</p>
          <div style={{ background: "rgba(201,146,42,0.12)", border: "1px solid rgba(201,146,42,0.25)", borderRadius: 10, padding: "1rem", textAlign: "left" }}>
            <div style={{ color: "var(--gold-light)", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Login with</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>Your <strong style={{ color: "white" }}>email address</strong> or <strong style={{ color: "white" }}>registration number</strong></div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 3.5rem" }}>
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
          <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "inline-block", marginBottom: "1.5rem" }}>← Back to home</Link>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--navy)", marginBottom: "0.3rem" }}>Student Sign In</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.8rem" }}>Use your email or registration number</p>

          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Registration Number</label>
              <input className="form-control" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="e.g. PG/2024/0142 or you@uni.edu" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? <><span className="spinner" />&nbsp;Signing in...</> : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--navy)", fontWeight: 500 }}>Register here</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
