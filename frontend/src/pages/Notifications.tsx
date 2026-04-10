import React, { useEffect, useState } from "react";
import StudentLayout from "../components/StudentLayout";
import { notificationsAPI } from "../lib/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getMy()
      .then(r => setNotifications(r.data.notifications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await notificationsAPI.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-page"><div className="spinner dark" /></div>
      </StudentLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <StudentLayout>
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <div className="page-header-sub">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</div>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={() => notifications.forEach(n => !n.isRead && markRead(n.id))}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔔</div><div className="empty-text">No notifications yet.</div></div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.isRead ? "unread" : ""}`}
                style={{ cursor: !n.isRead ? "pointer" : "default" }}
                onClick={() => !n.isRead && markRead(n.id)}>
                {!n.isRead && <div className="notif-dot" />}
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-body">{n.message}</div>
                  <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
