import React, { useEffect, useState } from "react";
import StudentLayout from "../components/StudentLayout";
import { messagesAPI } from "../lib/api";

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const fetchMessages = () => {
    messagesAPI.getMy()
      .then(r => setMessages(r.data.messages))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError(""); setSuccess("");
    try {
      await messagesAPI.sendToAdmin(subject, body);
      setSuccess("Message sent to administrator.");
      setSubject(""); setBody(""); setComposing(false);
      fetchMessages();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.isRead && msg.recipient?.id) {
      messagesAPI.markRead(msg.id).catch(() => {});
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

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
          <h2>Messages</h2>
          <div className="page-header-sub">Communication with your moderator</div>
        </div>
        <button className="btn btn-gold" onClick={() => setComposing(true)}>✉️ New Message</button>
      </div>

      <div className="page-body">
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Compose modal */}
        {composing && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setComposing(false)}>
            <div className="modal">
              <h3>Message to Moderator</h3>
              {error && <div className="alert alert-danger">⚠️ {error}</div>}
              <form onSubmit={handleSend}>
                <div className="form-group">
                  <label>Subject *</label>
                  <input className="form-control" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." required />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea className="form-control" value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={5} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setComposing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={sending}>
                    {sending ? <><span className="spinner" />&nbsp;Sending...</> : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Message detail modal */}
        {selected && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <div className="modal" style={{ maxWidth: 600 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h3>{selected.subject}</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                From: <strong>{selected.sender?.fullName || "Unknown"}</strong> · {new Date(selected.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7, background: "var(--cream)", borderRadius: "var(--radius)", padding: "1rem" }}>
                {selected.body}
              </div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0 }}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-text">No messages yet. Send a message to your moderator.</div>
              <button className="btn btn-gold" style={{ marginTop: "1rem" }} onClick={() => setComposing(true)}>Send First Message</button>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`msg-item ${!msg.isRead && msg.recipient?.role !== "student" ? "unread" : ""}`}
                onClick={() => openMessage(msg)}>
                <div className="msg-meta">
                  <span className="msg-from">{msg.sender?.fullName || "Unknown"}</span>
                  <span className="msg-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="msg-subject">{msg.subject}</div>
                <div className="msg-preview">{msg.body}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
