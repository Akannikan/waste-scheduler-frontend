import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdClose, MdSend, MdCheckCircle,
  MdWarning, MdMessage, MdRefresh,
} from 'react-icons/md';
import client from '../../api/client';
import { getUsers, getZones } from '../../api';
import { SkeletonTable, PageLoading } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  low: '#6B7280', normal: '#1976D2', high: '#FF9800', urgent: '#D32F2F',
};
const STATUS_BADGE = {
  pending:     'badge-orange',
  accepted:    'badge-blue',
  in_progress: 'badge-blue',
  completed:   'badge-green',
  rejected:    'badge-red',
};

/* ── Chat panel shown as a right-side drawer ── */
function ChatPanel({ assignment, currentUserId, onClose, onRefresh }) {
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const sendMsg = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await client.post(`/assignments/${assignment.id}/messages`, { message: trimmed });
      setText('');
      toast.success('Message sent');
      onRefresh(assignment.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await client.put(`/assignments/${assignment.id}`, { status });
      toast.success(`Status → ${status.replace('_', ' ')}`);
      onRefresh(assignment.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const remainingStatuses = ['accepted', 'in_progress', 'completed', 'rejected']
    .filter(s => s !== assignment.status);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {assignment.title}
          </h3>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_BADGE[assignment.status]}`} style={{ textTransform: 'capitalize' }}>
              {assignment.status.replace('_', ' ')}
            </span>
            <span className="badge" style={{ background: `${PRIORITY_COLORS[assignment.priority]}18`, color: PRIORITY_COLORS[assignment.priority], textTransform: 'capitalize' }}>
              {assignment.priority}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
      </div>

      {/* Description + due date */}
      <div style={{ padding: '12px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
        <p style={{ margin: 0 }}>{assignment.description}</p>
        {assignment.dueDate && (
          <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--color-accent)' }}>
            ⏰ Due: {new Date(assignment.dueDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Assigned parties */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 16 }}>
        {[{ label: 'Admin', user: assignment.admin }, { label: 'Collector', user: assignment.collector }].map(({ label, user }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status actions */}
      {assignment.status !== 'completed' && assignment.status !== 'rejected' && (
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {remainingStatuses.map(s => (
            <button
              key={s}
              className="btn btn-ghost btn-sm"
              disabled={updating}
              onClick={() => changeStatus(s)}
              style={{ textTransform: 'capitalize', fontSize: 12, border: '1px solid var(--color-border)' }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Messages thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(!assignment.messages || assignment.messages.length === 0) && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, padding: '24px 0' }}>
            No messages yet — start the conversation below.
          </div>
        )}
        {assignment.messages?.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: isMe ? 'var(--color-primary)' : 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {msg.sender?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  padding: '9px 13px',
                  borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  background: isMe ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: isMe ? '#fff' : 'var(--color-text)',
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                  {msg.sender?.name} · {new Date(msg.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Type a message to collector..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
          style={{ flex: 1, fontSize: 13 }}
          disabled={sending}
        />
        <button
          className="btn btn-primary"
          onClick={sendMsg}
          disabled={sending || !text.trim()}
          style={{ flexShrink: 0, padding: '9px 14px' }}
        >
          <MdSend size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Create Assignment Modal ── */
function CreateModal({ collectors, zones, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { priority: 'normal' } });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await client.post('/assignments', {
        title:       data.title,
        description: data.description,
        collectorId: Number(data.collectorId),
        priority:    data.priority,
        zoneId:      data.zoneId   ? Number(data.zoneId)  : undefined,
        dueDate:     data.dueDate  || undefined,
        notes:       data.notes    || undefined,
      });
      toast.success('Assignment created — collector notified!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Assignment</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Collect waste from Lagos Island Zone A"
              {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Instructions *</label>
            <textarea rows={3} className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Detailed instructions for the collector..."
              {...register('description', { required: 'Instructions are required' })} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign to Collector *</label>
              <select className={`form-control ${errors.collectorId ? 'error' : ''}`}
                {...register('collectorId', { required: 'Select a collector' })}>
                <option value="">Select collector…</option>
                {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.collectorId && <p className="form-error">{errors.collectorId.message}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-control" {...register('priority')}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High ⚠️</option>
                <option value="urgent">Urgent 🚨</option>
              </select>
            </div>
          </div>

          <div className="grid-2 mt-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Zone</label>
              <select className="form-control" {...register('zoneId')}>
                <option value="">Any zone</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" {...register('dueDate')} />
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Internal Notes</label>
            <input type="text" className="form-control" placeholder="Optional notes (admin only)" {...register('notes')} />
          </div>

          <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create & Notify Collector'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminAssignmentsPage() {
  const [assignments,  setAssignments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [collectors,   setCollectors]   = useState([]);
  const [zones,        setZones]        = useState([]);
  const [showCreate,   setShowCreate]   = useState(false);
  const [activeChat,   setActiveChat]   = useState(null);   // full assignment object with messages
  const [loadingChat,  setLoadingChat]  = useState(false);

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  /* Fetch assignment list */
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  }, []);

  /* Fetch single assignment WITH messages (opens chat panel) */
  const openChat = async (id) => {
    setLoadingChat(true);
    try {
      const res = await client.get(`/assignments/${id}`);
      setActiveChat(res.data.assignment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assignment');
    } finally { setLoadingChat(false); }
  };

  /* Refresh chat panel after send / status update */
  const refreshChat = async (id) => {
    try {
      const res = await client.get(`/assignments/${id}`);
      setActiveChat(res.data.assignment);
      // Also refresh the list so unread counts update
      fetchList();
    } catch { /* silent */ }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await client.delete(`/assignments/${id}`);
      toast.success('Deleted');
      if (activeChat?.id === id) setActiveChat(null);
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  useEffect(() => {
    fetchList();
    getUsers({ role: 'collector', limit: 100 }).then(r => setCollectors(r.data.users || [])).catch(() => {});
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
  }, [fetchList]);

  const pending    = assignments.filter(a => a.status === 'pending').length;
  const inProgress = assignments.filter(a => ['accepted','in_progress'].includes(a.status)).length;
  const completed  = assignments.filter(a => a.status === 'completed').length;
  const unread     = assignments.reduce((n, a) => n + (a.unreadMessages || 0), 0);

  return (
    <div style={{ paddingRight: activeChat ? 436 : 0, transition: 'padding-right .25s ease' }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Assign duties to collectors and chat with them in real-time.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-icon" onClick={fetchList} title="Refresh"><MdRefresh size={18} /></button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <MdAdd /> Create Assignment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,.12)', color: 'var(--color-accent)' }}><MdWarning size={22} /></div>
          <div className="stat-info"><div className="stat-value">{pending}</div><div className="stat-label">Pending</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,.12)', color: 'var(--color-secondary)' }}><MdMessage size={22} /></div>
          <div className="stat-info"><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
          <div className="stat-info"><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(211,47,47,.12)', color: 'var(--color-danger)' }}><MdMessage size={22} /></div>
          <div className="stat-info"><div className="stat-value">{unread}</div><div className="stat-label">Unread Replies</div></div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : assignments.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No assignments yet"
            message="Create your first assignment to dispatch a collector."
            action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd /> Create Assignment</button>}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Collector</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>Messages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr
                    key={a.id}
                    style={{ cursor: 'pointer', background: activeChat?.id === a.id ? 'rgba(46,125,50,.05)' : '' }}
                    onClick={() => openChat(a.id)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {a.description?.slice(0, 55)}…
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {a.collector?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{a.collector?.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{a.collector?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${PRIORITY_COLORS[a.priority]}18`, color: PRIORITY_COLORS[a.priority], textTransform: 'capitalize' }}>
                        {a.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td>
                      {a.unreadMessages > 0
                        ? <span className="badge badge-red">{a.unreadMessages} new</span>
                        : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a._count?.messages || 0}</span>
                      }
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={loadingChat}
                          onClick={() => openChat(a.id)}
                        >
                          <MdMessage size={13} /> Chat
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => deleteAssignment(a.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-panel chat (right drawer) */}
      {loadingChat && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageLoading text="Loading chat…" />
        </div>
      )}
      {activeChat && !loadingChat && (
        <ChatPanel
          assignment={activeChat}
          currentUserId={currentUser?.id}
          onClose={() => setActiveChat(null)}
          onRefresh={refreshChat}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          collectors={collectors}
          zones={zones}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchList(); }}
        />
      )}
    </div>
  );
}
