import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdNotifications, MdSend, MdDelete, MdClose, MdBroadcastOnHome } from 'react-icons/md';
import { getNotifications, createNotification, deleteNotification } from '../../api';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const AUDIENCE_OPTIONS = [
  { value: '', label: 'Broadcast to All Users' },
  { value: 'resident', label: 'Residents Only' },
  { value: 'collector', label: 'Collectors Only' },
  { value: 'admin', label: 'Admins Only' },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { channel: 'in_app' },
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const onSend = async (data) => {
    setSending(true);
    try {
      await createNotification({
        title: data.title,
        message: data.message,
        userId: data.userId ? Number(data.userId) : undefined,
        channel: data.channel,
      });
      toast.success('Notification sent!');
      reset();
      setShowModal(false);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(ns => ns.filter(n => n.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const broadcast = notifications.filter(n => !n.userId);
  const targeted = notifications.filter(n => n.userId);

  const channelIcon = { in_app: '🔔', email: '📧', push: '📱' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Send announcements and alerts to residents, collectors, or admins.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdBroadcastOnHome /> Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdNotifications size={22} /></div>
          <div className="stat-info"><div className="stat-value">{notifications.length}</div><div className="stat-label">Total Sent</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdBroadcastOnHome size={22} /></div>
          <div className="stat-info"><div className="stat-value">{broadcast.length}</div><div className="stat-label">Broadcasts</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdSend size={22} /></div>
          <div className="stat-info"><div className="stat-value">{targeted.length}</div><div className="stat-label">Targeted</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)' }}><MdNotifications size={22} /></div>
          <div className="stat-info"><div className="stat-value">{unread}</div><div className="stat-label">Unread</div></div>
        </div>
      </div>

      {/* Quick send templates */}
      <div className="card mb-6">
        <h3 className="card-title mb-3">⚡ Quick Send Templates</h3>
        <div className="grid-2" style={{ gap: 10 }}>
          {[
            { title: '🗑️ Pickup Reminder', message: 'This is a reminder that waste collection is scheduled for tomorrow in your zone. Please put out your bins before 7am.' },
            { title: '📢 Sanitation Day', message: "This Saturday is Lagos Sanitation Day! Join your community for a clean-up exercise. Let's keep Nigeria clean 🇳🇬" },
            { title: '💳 Bill Due Soon', message: 'Your monthly waste fee is due in 3 days. Please make payment to avoid service interruption.' },
            { title: '✅ New Recycling Center', message: 'A new recycling center has opened near you. Check the Map section for location and accepted waste types.' },
          ].map((tmpl, i) => (
            <button
              key={i}
              className="btn btn-ghost"
              style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', height: 'auto' }}
              onClick={() => {
                reset({ title: tmpl.title, message: tmpl.message, channel: 'in_app' });
                setShowModal(true);
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{tmpl.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{tmpl.message.slice(0, 60)}...</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      {loading ? <SkeletonTable rows={6} /> : notifications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdNotifications />}
            title="No notifications sent yet"
            message="Use the button above to send your first notification."
            action={<button className="btn btn-primary" onClick={() => setShowModal(true)}><MdSend /> Send Now</button>}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Notification History</h3>
          </div>
          {notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: n.userId ? 'rgba(25,118,210,0.12)' : 'rgba(46,125,50,0.12)',
                color: n.userId ? 'var(--color-secondary)' : 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {channelIcon[n.channel] || '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                  <span className={`badge ${n.userId ? 'badge-blue' : 'badge-green'}`}>
                    {n.userId ? 'Targeted' : 'Broadcast'}
                  </span>
                  <span className="badge badge-grey" style={{ textTransform: 'capitalize' }}>{n.channel.replace('_', ' ')}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>{timeAgo(n.createdAt)}</span>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                style={{ color: 'var(--color-danger)', flexShrink: 0 }}
                onClick={() => handleDelete(n.id)}
                title="Delete"
              >
                <MdDelete size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Send Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Send Notification</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleSubmit(onSend)} noValidate>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'error' : ''}`}
                  placeholder="Notification title..."
                  {...register('title', { required: 'Title is required', maxLength: 255 })}
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className={`form-control ${errors.message ? 'error' : ''}`}
                  rows={4}
                  placeholder="Write your message to users..."
                  {...register('message', { required: 'Message is required' })}
                />
                {errors.message && <p className="form-error">{errors.message.message}</p>}
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Channel</label>
                  <select className="form-control" {...register('channel')}>
                    <option value="in_app">🔔 In-App</option>
                    <option value="email">📧 Email</option>
                    <option value="push">📱 Push</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target User ID</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Leave blank to broadcast"
                    {...register('userId')}
                  />
                  <p className="form-hint">Leave blank to send to everyone</p>
                </div>
              </div>

              <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
                💡 Leave Target User ID blank to send to all users. Fill it in to target a specific resident.
              </div>

              <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  <MdSend /> {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
