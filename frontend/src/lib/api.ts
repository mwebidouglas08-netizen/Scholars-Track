import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (identifier: string, password: string) => api.post("/auth/login", { identifier, password }),
  adminLogin: (email: string, password: string) => api.post("/auth/admin-login", { email, password }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Submissions
export const submissionsAPI = {
  getMy: () => api.get("/submissions/my"),
  getProgress: () => api.get("/submissions/progress"),
  create: (data: any) => api.post("/submissions", data),
  getAll: () => api.get("/submissions"),
  review: (id: string, data: any) => api.patch(`/submissions/${id}/review`, data),
};

// Notifications
export const notificationsAPI = {
  getMy: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  send: (data: any) => api.post("/notifications", data),
  getAll: () => api.get("/notifications/all"),
};

// Messages
export const messagesAPI = {
  getMy: () => api.get("/messages"),
  getUnreadCount: () => api.get("/messages/unread-count"),
  send: (data: any) => api.post("/messages", data),
  sendToAdmin: (subject: string, body: string) => api.post("/messages/to-admin", { subject, body }),
  markRead: (id: string) => api.patch(`/messages/${id}/read`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  addUser: (data: any) => api.post("/admin/users", data),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAdmins: () => api.get("/admin/admins"),
};
