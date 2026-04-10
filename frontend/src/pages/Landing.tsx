import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", position: "relative", overflow: "hidden" }}>
      {/* Background decorations */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(201,146,42,0.07)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(201,146,42,0.05)", bottom: -100, left: -80, pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.4rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brand-icon">S</div>
          <div>
            <div className="brand-name">ScholarsTrack</div>
            <div className="brand-tagline">Graduate Research Management</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link to="/login" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
            Student Login
          </Link>
          <Link to="/register" style={{ background: "var(--gold)", color: "white", padding: "8px 20px", borderRadius: 8, fontSize: "0.875rem", fontWeight: 500 }}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "5rem 2rem 3rem", position: "relative", zIndex: 5 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,146,42,0.12)", border: "1px solid rgba(201,146,42,0.3)", color: "var(--gold-light)", padding: "5px 16px", borderRadius: 100, fontSize: "0.72rem", letterSpacing: "0.08em", fontWeight: 500, marginBottom: "1.8rem", textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-light)", display: "block" }} />
          Postgraduate Research Tracking System
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.2rem", maxWidth: 720 }}>
          Track Your Research <span style={{ color: "var(--gold-light)" }}>Journey</span> from Proposal to Publication
        </h1>

        <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", maxWidth: 540, lineHeight: 1.75, marginBottom: "2.5rem", fontWeight: 300 }}>
          ScholarsTrack helps graduate students at all levels seamlessly submit proposals, track review stages, and receive real-time feedback from their department through to the postgraduate board.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/register" className="btn btn-gold btn-lg">
            Get Started — Register
          </Link>
          <Link to="/login" className="btn btn-lg" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}>
            Sign In to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "2.5rem", marginTop: "4rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { num: "3", label: "Academic Levels" },
            { num: "4", label: "Submission Types" },
            { num: "3", label: "Review Stages" },
            { num: "100%", label: "Progress Visibility" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", fontWeight: 600, color: "var(--gold-light)" }}>{s.num}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Cards */}
      <div style={{ display: "flex", gap: "1rem", padding: "2rem 3rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { icon: "🎓", label: "Bachelor's Degree", desc: "Undergraduate research track" },
          { icon: "📘", label: "Master's Degree", desc: "Postgraduate research track" },
          { icon: "🔬", label: "PhD / Doctorate", desc: "Doctoral research track" },
          { icon: "🏛️", label: "Postgraduate Board", desc: "Final institutional approval" },
        ].map((item) => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "1rem 1.4rem", display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
            <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
            <div>
              <div style={{ color: "white", fontSize: "0.9rem", fontWeight: 500 }}>{item.label}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "3rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Everything You Need</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>A complete academic research management platform</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", maxWidth: 900, margin: "0 auto" }}>
          {[
            { icon: "📤", title: "Smart Submissions", desc: "Submit proposals, results, presentations and publications in one place" },
            { icon: "📊", title: "Progress Tracking", desc: "Real-time pipeline from department to postgraduate board" },
            { icon: "⭐", title: "Auto Scoring", desc: "Weighted scoring across all submission types" },
            { icon: "🔔", title: "Notifications", desc: "Instant alerts on approvals, revisions and feedback" },
            { icon: "💬", title: "Direct Messaging", desc: "Communicate directly with your academic moderator" },
            { icon: "🔐", title: "Secure Access", desc: "Separate student and admin portals with role protection" },
          ].map((f) => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "1.2rem" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{f.icon}</div>
              <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.3rem" }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>
        © 2024 ScholarsTrack — Graduate Research Management System
      </div>
    </div>
  );
}
