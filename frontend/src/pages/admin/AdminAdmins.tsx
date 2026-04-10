import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminAPI } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", regNumber: "", level: "admin", department: "Administration", password: "", role: "admin" });
  const { toasts, addToast, removeToast } = useToast();

  const fetchAdmins = () => {
    adminAPI.getAdmins()
      .then(r => setAdmins(r.data.admins))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addUser({ ...form, role: "admin", level: "admin", department: "Administration" });
      addToast("Admin moderator added successfully", "success");
      setShowAdd(false);
      setForm({ fullName: "", email: "", phone: "", regNumber: "", level: "admin", department: "Administration", password: "", role: "admin" });
      fetchAdmins();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to add admin", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove admin access for ${name}?`)) return;
    try {
      await adminAPI.deleteUser(id);
      addToast("Admin removed", "success");
      fetchAdmins();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to remove", "error");
    }
  };

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="page-header">
        <div><h2>Admin Users</h2><div className="page-header-sub">Manage system moderators and administrators</div></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Admin</button>
      </div>

      <div className="page-body">
        <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
          🔐 Admin users have full access to the system including student management, submission review, and notification sending.
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="empty-state"><div className="spinner dark" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Added</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={a.id}>
                    <td><strong>{a.fullName}</strong></td>
                    <td style={{ fontSize: "0.82rem" }}>{a.email}</td>
                    <td style={{ fontSize: "0.82rem" }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      {i === 0 ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>System Admin</span>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id, a.fullName)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Default credentials info */}
        <div className="card" style={{ marginTop: "1.5rem", background: "#1A1A2E", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#a5b4fc", marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>🔐 Default Admin Credentials</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Email</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "#c7d2fe" }}>admin@scholarstrack.edu</div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Password</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "#c7d2fe" }}>Admin@ScholarsTrack2024</div>
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "0.6rem" }}>Change these credentials in production via environment variables: ADMIN_EMAIL and ADMIN_PASSWORD</div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <h3>Add Admin Moderator</h3>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required /></div>
                <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
                <div className="form-group"><label>Staff ID / Reg. No *</label><input className="form-control" value={form.regNumber} onChange={e => setForm(p => ({ ...p, regNumber: e.target.value }))} placeholder="e.g. STAFF-001" required /></div>
              </div>
              <div className="form-group"><label>Temporary Password *</label><input className="form-control" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
