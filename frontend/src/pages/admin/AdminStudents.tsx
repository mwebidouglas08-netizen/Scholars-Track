import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminAPI } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";

const levelLabel = (l: string) => ({ bachelor: "Bachelor's", masters: "Master's", phd: "PhD", admin: "Admin" }[l] || l);
const levelClass = (l: string) => ({ bachelor: "badge-bachelor", masters: "badge-masters", phd: "badge-phd" }[l] || "badge-pending");

export default function AdminStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", regNumber: "", level: "bachelor", department: "", password: "", role: "student" });

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.regNumber.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchLevel = !levelFilter || u.level === levelFilter;
    return matchSearch && matchLevel && u.role !== "admin";
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addUser(form);
      addToast("Student added successfully", "success");
      setShowAdd(false);
      setForm({ fullName: "", email: "", phone: "", regNumber: "", level: "bachelor", department: "", password: "", role: "student" });
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to add student", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      addToast("Student removed", "success");
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h2>Student Management</h2>
          <div className="page-header-sub">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Student</button>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input className="form-control" style={{ flex: 1 }} placeholder="Search by name, reg. number or email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ width: 160 }} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="">All levels</option>
            <option value="bachelor">Bachelor's</option>
            <option value="masters">Master's</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="empty-state"><div className="spinner dark" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">No students found</div></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Reg. Number</th><th>Email</th><th>Phone</th>
                    <th>Level</th><th>Department</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.fullName}</strong></td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{u.regNumber}</td>
                      <td style={{ fontSize: "0.82rem" }}>{u.email}</td>
                      <td style={{ fontSize: "0.82rem" }}>{u.phone || "—"}</td>
                      <td><span className={`badge ${levelClass(u.level)}`}>{levelLabel(u.level)}</span></td>
                      <td style={{ fontSize: "0.82rem" }}>{u.department}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditUser(u)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.fullName)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <h3>Add New Student</h3>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required /></div>
                <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone *</label><input className="form-control" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
                <div className="form-group"><label>Reg. Number *</label><input className="form-control" value={form.regNumber} onChange={e => setForm(p => ({ ...p, regNumber: e.target.value }))} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Level *</label>
                  <select className="form-control" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    <option value="bachelor">Bachelor's</option><option value="masters">Master's</option><option value="phd">PhD</option>
                  </select>
                </div>
                <div className="form-group"><label>Department *</label><input className="form-control" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required /></div>
              </div>
              <div className="form-group"><label>Temporary Password *</label><input className="form-control" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <h3>Edit Student</h3>
            <div className="form-group"><label>Full Name</label><input className="form-control" defaultValue={editUser.fullName} id="edit-name" /></div>
            <div className="form-group"><label>Email</label><input className="form-control" defaultValue={editUser.email} id="edit-email" /></div>
            <div className="form-group"><label>Phone</label><input className="form-control" defaultValue={editUser.phone} id="edit-phone" /></div>
            <div className="form-group"><label>Department</label><input className="form-control" defaultValue={editUser.department} id="edit-dept" /></div>
            <div className="form-group"><label>Level</label>
              <select className="form-control" defaultValue={editUser.level} id="edit-level">
                <option value="bachelor">Bachelor's</option><option value="masters">Master's</option><option value="phd">PhD</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                const name = (document.getElementById("edit-name") as HTMLInputElement).value;
                const email = (document.getElementById("edit-email") as HTMLInputElement).value;
                const phone = (document.getElementById("edit-phone") as HTMLInputElement).value;
                const dept = (document.getElementById("edit-dept") as HTMLInputElement).value;
                const level = (document.getElementById("edit-level") as HTMLSelectElement).value;
                try {
                  await adminAPI.updateUser(editUser.id, { fullName: name, email, phone, department: dept, level });
                  addToast("Student updated", "success");
                  setEditUser(null);
                  fetchUsers();
                } catch {
                  addToast("Failed to update", "error");
                }
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
