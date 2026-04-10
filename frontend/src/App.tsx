import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

// Student pages
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Submissions from "./pages/Submissions";
import NewSubmission from "./pages/NewSubmission";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminAdmins from "./pages/admin/AdminAdmins";

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner dark" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner dark" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner dark" /></div>;
  if (user) return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/admin/login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />

      {/* Student routes */}
      <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
      <Route path="/dashboard/progress" element={<StudentRoute><Progress /></StudentRoute>} />
      <Route path="/dashboard/submissions" element={<StudentRoute><Submissions /></StudentRoute>} />
      <Route path="/dashboard/new-submission" element={<StudentRoute><NewSubmission /></StudentRoute>} />
      <Route path="/dashboard/notifications" element={<StudentRoute><Notifications /></StudentRoute>} />
      <Route path="/dashboard/messages" element={<StudentRoute><Messages /></StudentRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
      <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
      <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
      <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
