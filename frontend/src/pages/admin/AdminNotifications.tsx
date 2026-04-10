import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { notificationsAPI, adminAPI } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";

export default function AdminNotifications() {
  const [students, setStudents] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", message: "", recipientId: "", sendToAll: true });
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    adminAPI.getUsers().then(r => setStudents(r.data.users.filter((u: any) => u.role === "student"))).catch(() => {});
    notificationsAPI.getAll().then(r => setSent(r.data.notifications)).catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) { addToast("Title and message are required", "error"); return; }
    if (!form.sendToAll && !form.recipientId) { addToast("Please select a recipient", "error"); return; }
    setLoading(true);
    try {
      await notificationsAPI.send({ title: form.title, message: form.message, recipientId: form.sendToAll ? null : form.recipientId, sendToAll: form.sendToAll });
      addToast(form.sendToAll ? "Notification broadcast to all students!" : "Notification sent!", "success");
      setForm({ title: "", message: "", recipientId: "", sendToAll: true });
      notificationsAPI.getAll().then(r => setSent(r.data.notifications)).catch(() => {});
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to send", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="page-header">
        <div><h2>Send Notifications</h2><div className="page-header-sub">Broadcast or targeted messages to students</div></div>
      </div>
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Compose */}
          <div className="card">
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>✉️ Compose Notification</div>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Recipients</label>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", cursor: "pointer", fontWeight: 400 }}>
                    <input type="radio" checked={form.sendToAll} onChange={() => setForm(p => ({ ...p, sendToAll: true, recipientId: "" }))} /> All Students
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", cursor: "pointer", fontWeight: 400 }}>
                    <input type="radio" checked={!form.sendToAll} onChange={() => setForm(p => ({ ...p, sendToAll: false }))} /> Specific Student
                  </label>
                </div>
                {!form.sendToAll && (
                  <select className="form-control" value={form.recipientId} onChange={e => setForm(p => ({ ...p, recipientId: e.target.value }))}>
                    <option value="">— Select student —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.regNumber})</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Notification Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Submission Deadline Reminder" required />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea className="form-control" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your notification message..." rows={5} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                {loading ? <><span className="spinner" />&nbsp;Sending...</> : `📤 Send ${form.sendToAll ? "to All Students" : "Notification"}`}
              </button>
            </form>
          </div>

          {/* Sent history */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.2rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--navy)", borderBottom: "1px solid var(--border)" }}>📋 Sent History</div>
            {sent.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🔔</div><div className="empty-text">No notifications sent yet</div></div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {sent.map(n => (
                  <div key={n.id} style={{ padding: "0.9rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)" }}>{n.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-mid)", lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>
                      {n.recipientId ? "→ Specific student" : "→ All students (broadcast)"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
