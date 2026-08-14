import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdInbox, MdSend, MdCompose, MdClose, MdDelete,
  MdMarkEmailRead, MdSearch, MdPerson,
} from 'react-icons/md';
import client from '../api/client';
import { getUsers } from '../api';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

const ROLE_COLORS = {
  admin: { bg: 'rgba(211,47,47,0.12)', color: '#D32F2F', label: 'Admin' },
  collector: { bg: 'rgba(25,118,210,0.12)', color: '#1976D2', label: 'Collector' },
  resident: { bg: 'rgba(46,125,50,0.12)', color: '#2E7D32', label: 'Resident' },
};

// ── Compose Modal ─────────────────────────────────────────────
function ComposeModal({ onClose, onSent, currentUser }) {
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    getUsers({ limit: 100 })
      .then(r => setUsers((r.data.users || []).filter(u => u.id !== currentUser?.id)))
      .catch(() => {});
  }, [currentUser]);

  const filteredUsers = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const onSend = async (data) => {
    setSending(true);
    try {
      await client.post('/messages', {
        receiverId: Number(data.receiverId),
        subject: data.subject || undefined,
        body: data.body,
      });
      toast.success('Message sent!');
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Message</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>

        <form onSubmit={handleSubmit(onSend)} noValidate>
          {/* Recipient search */}
          <div className="form-group">
            <label className="form-label">To *</label>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <span className="input-icon"><MdSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className={`form-control ${errors.receiverId ? 'error' : ''}`}
              {...register('receiverId', { required: 'Select a recipient' })}
              size={Math.min(5, filteredUsers.length || 1)}
              style={{ height: 'auto' }}
            >
              {filteredUsers.length === 0 && <option disabled>No users found</option>}
              {filteredUsers.map(u => {
                const rc = ROLE_COLORS[u.role] || {};
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.email}
                  </option>
                );
              })}
            </select>
            {errors.receiverId && <p className="form-error">{errors.receiverId.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              placeholder="Optional subject..."
              {...register('subject')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className={`form-control ${errors.body ? 'error' : ''}`}
              rows={5}
              placeholder="Write your message here..."
              {...register('body', {
                required: 'Message is required',
                minLength: { value: 2, message: 'Too short' },
              })}
            />
            {errors.body && <p className="form-error">{errors.body.message}</p>}
          </div>

          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <MdSend /> {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Message Detail Panel ──────────────────────────────────────
function MessageDetail({ message, type, onClose, onDelete }) {
  const person = type === 'inbox' ? message.sender : message.receiver;
  const rc = ROLE_COLORS[person?.role] || {};

  return (
    <div style={{
      flex: 1,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>
            {message.subject || '(No subject)'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: rc.bg, color: rc.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
            }}>
              {person?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{person?.name}</span>
              <span
                className="badge"
                style={{ background: rc.bg, color: rc.color, marginLeft: 8, textTransform: 'capitalize', fontSize: 10 }}
              >
                {person?.role}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {new Date(message.createdAt).toLocaleString('en-NG', {
                weekday: 'short', day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--color-danger)' }}
            onClick={() => onDelete(message.id)}
            title="Delete"
          >
            <MdDelete size={18} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--color-text)',
          whiteSpace: 'pre-wrap',
        }}>
          {message.body}
        </div>
      </div>
    </div>
  );
}

// ── Message Row ───────────────────────────────────────────────
function MessageRow({ message, type, isSelected, onClick }) {
  const person = type === 'inbox' ? message.sender : message.receiver;
  const rc = ROLE_COLORS[person?.role] || {};
  const unread = type === 'inbox' && !message.isRead;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        background: isSelected
          ? 'rgba(46,125,50,0.08)'
          : unread
            ? 'rgba(46,125,50,0.03)'
            : 'transparent',
        borderBottom: '1px solid var(--color-border)',
        borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: rc.bg, color: rc.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 15,
      }}>
        {person?.name?.charAt(0).toUpperCase() || '?'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: unread ? 700 : 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {person?.name || 'Unknown'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {timeAgo(message.createdAt)}
          </span>
        </div>
        <div style={{
          fontSize: 13, fontWeight: unread ? 600 : 400,
          color: unread ? 'var(--color-text)' : 'var(--color-text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
        }}>
          {message.subject || '(No subject)'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {message.body}
        </div>
      </div>

      {unread && (
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 4 }} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MessagesPage() {
  const [tab, setTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState('');

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const [inRes, sentRes] = await Promise.all([
        client.get('/messages/inbox'),
        client.get('/messages/sent'),
      ]);
      setInbox(inRes.data.messages || []);
      setUnreadCount(inRes.data.unread || 0);
      setSent(sentRes.data.messages || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  // Mark as read when selected
  const handleSelect = async (msg, type) => {
    setSelected({ ...msg, _type: type });
    if (type === 'inbox' && !msg.isRead) {
      try {
        await client.patch(`/messages/${msg.id}/read`);
        setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        setUnreadCount(n => Math.max(0, n - 1));
      } catch { /* silent */ }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await client.delete(`/messages/${id}`);
      setInbox(prev => prev.filter(m => m.id !== id));
      setSent(prev => prev.filter(m => m.id !== id));
      setSelected(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const messages = (tab === 'inbox' ? inbox : sent).filter(m => {
    if (!search) return true;
    const person = tab === 'inbox' ? m.sender : m.receiver;
    return (
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.body?.toLowerCase().includes(search.toLowerCase()) ||
      person?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">
            Send and receive messages between admins, collectors, and residents.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
          <MdCompose /> Compose
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 240px)', minHeight: 500 }}>
        {/* Left panel — list */}
        <div style={{
          width: 360,
          flexShrink: 0,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 4px',
          }}>
            {[
              { key: 'inbox', icon: <MdInbox size={16} />, label: 'Inbox', count: unreadCount },
              { key: 'sent', icon: <MdSend size={16} />, label: 'Sent', count: 0 },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelected(null); }}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: tab === t.key ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                {t.icon}
                {t.label}
                {t.count > 0 && (
                  <span style={{ background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <div className="input-group">
              <span className="input-icon"><MdSearch size={15} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: 13, padding: '8px 8px 8px 36px' }}
              />
            </div>
          </div>

          {/* Message list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '70%' }} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <MdInbox size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>
                  {search ? 'No messages match your search' : tab === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <MessageRow
                  key={msg.id}
                  message={msg}
                  type={tab}
                  isSelected={selected?.id === msg.id}
                  onClick={() => handleSelect(msg, tab)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel — detail or empty state */}
        {selected ? (
          <MessageDetail
            message={selected}
            type={selected._type}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
          />
        ) : (
          <div style={{
            flex: 1,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            color: 'var(--color-text-muted)',
          }}>
            <MdInbox size={56} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 15 }}>Select a message to read</p>
            <button className="btn btn-outline btn-sm" onClick={() => setShowCompose(true)}>
              <MdCompose /> Compose New Message
            </button>
          </div>
        )}
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSent={() => { setShowCompose(false); fetchMessages(); }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
