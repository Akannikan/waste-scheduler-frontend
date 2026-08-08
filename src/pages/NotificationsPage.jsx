import { useEffect, useState } from 'react';
import { MdNotifications, MdDone, MdDoneAll, MdDelete } from 'react-icons/md';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../api';
import EmptyState from '../components/common/EmptyState';
import { PageLoading } from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((ns) => ns.filter((n) => n.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllRead}>
            <MdDoneAll /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <PageLoading />
      ) : notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdNotifications />} title="No notifications" message="You'll be notified about upcoming pickups, report updates, and announcements here." />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: n.isRead ? 'transparent' : 'rgba(46,125,50,0.03)',
                transition: 'background var(--transition)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: n.isRead ? 'var(--color-surface-2)' : 'rgba(46,125,50,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: n.isRead ? 'var(--color-text-muted)' : 'var(--color-primary)',
                }}
              >
                <MdNotifications size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14 }}>{n.title}</span>
                  {!n.isRead && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 6, display: 'block' }}>{timeAgo(n.createdAt)}</span>
              </div>

              <div className="flex gap-1" style={{ flexShrink: 0 }}>
                {!n.isRead && (
                  <button className="btn btn-ghost btn-icon" title="Mark as read" onClick={() => handleMarkRead(n.id)}>
                    <MdDone size={16} />
                  </button>
                )}
                <button className="btn btn-ghost btn-icon" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(n.id)}>
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
