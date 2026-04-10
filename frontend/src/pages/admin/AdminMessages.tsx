import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { messagesAPI, adminAPI } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";

export default function AdminMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [composing, setComposing] = useState(false);
  const [replyForm, setReplyForm] = useState({ recipientId: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const fetchMessages = () => {
    messagesAPI.getMy()
      .then(r => setMessages(r.data.messages))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    adminAPI.getUsers().then(r => setStudents(r.data.users.filter((u: any) => u.role === "student"))).catch(() => {});
  }, []);

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.isRead) {
      messagesAPI.markRead(msg.id).catch(() => {});
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    // Pre-fill reply
    if (msg.sender?.id !== user?.id) {
      setReplyForm({ recipientId: msg.sender?.id || "", subject: `Re: ${msg.subject}`, body: "" });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagesAPI.send({ recipientId: replyForm.recipientId, subject: replyForm.subject, body: replyForm.body });
      addToast("Message sent successfully", "success");
      setComposing(false);
      setReplyForm({ recipientId: "", subject: "", body: "" });
      fetchMessages();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to send", "error");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!replyForm.body) { addToast("Please write a reply", "error"); return; }
    setSending(true);
    try {
      await messagesAPI.send({ recipientId: replyForm.recipientId, subject: replyForm.subject, body: replyForm.body });
      addToast("Reply sent!", "success");
      setReplyForm(p => ({ ...p, body: "" }));
      fetchMessages();
    } catch {
      addToast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  };

  const unread = messages.filter(m => !m.isRead && m.recipient?.id === user?.id).length;

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="page-header">
        <div><h2>Messages</h2><div className="page-header-sub">{unread > 0 ? `${unread} unread` : "All messages"}</div></div>
        <button className="btn btn-primary" onClick={() => setComposing(true)}>+ New Message</button>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", minHeight: 500 }}>
          {/* Message list */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {loading ? (
              <div className="empty-state"><div className="spinner dark" /></div>
            ) : messages.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">💬</div><div className="empty-text">No messages yet</div></div>
            ) : (
              messages.map(msg => (
                <div key={msg.id}
                  className={`msg-item ${!msg.isRead && msg.recipient?.id === user?.id ? "unread" : ""} ${selected?.id === msg.id ? "" : ""}`}
                  style={{ background: selected?.id === msg.id ? "var(--cream)" : undefined }}
                  onClick={() => openMessage(msg)}>
                  <div className="msg-meta">
                    <span className="msg-from">{msg.sender?.id === user?.id ? `To: ${msg.recipient?.fullName}` : `From: ${msg.sender?.fullName}`}</span>
                    <span className="msg-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="msg-subject">{msg.subject}</div>
                  <div className="msg-preview">{msg.body}</div>
                </div>
              ))
            )}
          </div>

          {/* Message detail */}
          <div className="card">
            {selected ? (
              <>
                <div style={{ marginBottom: "1.2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "var(--navy)", marginBottom: "0.4rem" }}>{selected.subject}</h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    From: <strong style={{ color: "var(--text-dark)" }}>{selected.sender?.fullName}</strong> ·{" "}
                    To: <strong style={{ color: "var(--text-dark)" }}>{selected.recipient?.fullName}</strong> ·{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.75, background: "var(--cream)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1.2rem" }}>
                  {selected.body}
                </div>
                {selected.sender?.id !== user?.id && (
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.6rem" }}>Reply to {selected.sender?.fullName}</div>
                    <textarea className="form-control" value={replyForm.body} onChange={e => setReplyForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your reply..." rows={3} style={{ marginBottom: "0.8rem" }} />
                    <button className="btn btn-primary" onClick={handleReply} disabled={sending}>
                      {sending ? <><span className="spinner" />&nbsp;Sending...</> : "Send Reply"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <div className="empty-text">Select a message to read it</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {composing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setComposing(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <h3>New Message to Student</h3>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Recipient *</label>
                <select className="form-control" value={replyForm.recipientId} onChange={e => setReplyForm(p => ({ ...p, recipientId: e.target.value }))} required>
                  <option value="">— Select student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.regNumber})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input className="form-control" value={replyForm.subject} onChange={e => setReplyForm(p => ({ ...p, subject: e.target.value }))} placeholder="Message subject..." required />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea className="form-control" value={replyForm.body} onChange={e => setReplyForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your message..." rows={5} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setComposing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? <><span className="spinner" />&nbsp;Sending...</> : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
