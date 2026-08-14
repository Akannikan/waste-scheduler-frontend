import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { MdAdd, MdClose, MdSend, MdCheckCircle, MdWarning, MdPerson, MdMessage } from 'react-icons/md';
import client from '../../api/client';
import { getUsers, getZones, getSchedules } from '../../api';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = { low: '#888', normal: '#1976D2', high: '#FF9800', urgent: '#D32F2F' };
const STATUS_COLORS = { pending: 'badge-orange', accepted: 'badge-blue', in_progress: 'badge-blue', completed: 'badge-green', rejected: 'badge-red' };

function AssignmentDetail({ assignment, onClose, onRefresh, currentUserId }) {
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await client.post(`/assignments/${assignment.id}/messages`, { message: msgText });
      setMsgText('');
      onRefresh();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await client.put(`/assignments/${assignment.id}`, { status });
      toast.success(`Status updated to ${status}`);
      onRefresh();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{assignment.title}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className={`badge ${STATUS_COLORS[assignment.status]}`} style={{ textTransform: 'capitalize' }}>{assignment.status.replace('_', ' ')}</span>
              <span className="badge" style={{ background: `${PRIORITY_COLORS[assignment.priority]}20`, color: PRIORITY_COLORS[assignment.priority] }}>
                {assignment.priority}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>

        <div style={{ padding: '0 0 16px', flex: 1, overflowY: 'auto' }}>
          {/* Description */}
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{assignment.description}</p>
            {assignment.dueDate && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                📅 Due: {new Date(assignment.dueDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>

          {/* Parties */}
          <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Assigned By', user: assignment.admin },
              { label: 'Assigned To', user: assignment.collector },
            ].map(({ label, user }) => (
              <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user?.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin status actions */}
          {assignment.status !== 'completed' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Update Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['accepted', 'in_progress', 'completed', 'rejected'].filter(s => s !== assignment.status).map(s => (
                  <button key={s} className="btn btn-ghost btn-sm" style={{ textTransform: 'capitalize', border: '1px solid var(--color-border)' }} disabled={updating} onClick={() => updateStatus(s)}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
              Messages ({assignment.messages?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 12 }}>
              {assignment.messages?.length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No messages yet. Start the conversation!</p>
              )}
              {assignment.messages?.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? 'var(--color-primary)' : 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {msg.sender?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--color-primary)' : 'var(--color-surface-2)', color: isMe ? '#fff' : 'var(--color-text)', fontSize: 13, lineHeight: 1.5 }}>
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

            {/* Message input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={sendMessage} disabled={sending || !msgText.trim()}>
                <MdSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [zones, setZones] = useState([]);
  const [currentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { priority: 'normal' } });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchDetail = async (id) => {
    const res = await client.get(`/assignments/${id}`);
    setDetail(res.data.assignment);
  };

  useEffect(() => {
    fetchAssignments();
    getUsers({ role: 'collector', limit: 100 }).then(r => setCollectors(r.data.users || [])).catch(() => {});
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
  }, [fetchAssignments]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await client.post('/assignments', {
        title: data.title,
        description: data.description,
        collectorId: Number(data.collectorId),
        priority: data.priority,
        zoneId: data.zoneId ? Number(data.zoneId) : undefined,
        dueDate: data.dueDate || undefined,
        notes: data.notes,
      });
      toast.success('Assignment created and collector notified!');
      reset();
      setShowCreate(false);
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try { await client.delete(`/assignments/${id}`); toast.success('Deleted'); fetchAssignments(); }
    catch { toast.error('Failed to delete'); }
  };

  const pending = assignments.filter(a => a.status === 'pending').length;
  const inProgress = assignments.filter(a => a.status === 'in_progress' || a.status === 'accepted').length;
  const completed = assignments.filter(a => a.status === 'completed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignment Management</h1>
          <p className="page-subtitle">Assign duties to collectors and communicate in real-time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <MdAdd /> Create Assignment
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdWarning size={22} /></div>
          <div className="stat-info"><div className="stat-value">{pending}</div><div className="stat-label">Pending</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdPerson size={22} /></div>
          <div className="stat-info"><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
          <div className="stat-info"><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(126,87,194,0.12)', color: '#7E57C2' }}><MdMessage size={22} /></div>
          <div className="stat-info"><div className="stat-value">{assignments.reduce((s, a) => s + (a.unreadMessages || 0), 0)}</div><div className="stat-label">Unread Messages</div></div>
        </div>
      </div>

      {loading ? <SkeletonTable rows={6} /> : assignments.length === 0 ? (
        <div className="card"><EmptyState title="No assignments yet" message="Create your first assignment to dispatch a collector." action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd /> Create Assignment</button>} /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Title</th><th>Collector</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Messages</th><th>Actions</th></tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => fetchDetail(a.id).then(() => {})}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.description?.slice(0, 50)}...</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                          {a.collector?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13 }}>{a.collector?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${PRIORITY_COLORS[a.priority]}20`, color: PRIORITY_COLORS[a.priority], textTransform: 'capitalize' }}>
                        {a.priority}
                      </span>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[a.status]}`} style={{ textTransform: 'capitalize' }}>{a.status.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td>
                      {a.unreadMessages > 0 ? (
                        <span className="badge badge-red">{a.unreadMessages} new</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{a._count?.messages || 0}</span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary btn-sm" onClick={() => fetchDetail(a.id)}>
                          <MdMessage size={14} /> Chat
                        </button>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(a.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Assignment</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className={`form-control ${errors.title ? 'error' : ''}`} placeholder="e.g. Collect waste from Lagos Island Zone A"
                  {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea rows={3} className={`form-control ${errors.description ? 'error' : ''}`} placeholder="Detailed instructions for the collector..."
                  {...register('description', { required: 'Description is required' })} />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assign to Collector *</label>
                  <select className={`form-control ${errors.collectorId ? 'error' : ''}`} {...register('collectorId', { required: 'Select a collector' })}>
                    <option value="">Select collector...</option>
                    {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.collectorId && <p className="form-error">{errors.collectorId.message}</p>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid-2 mt-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Zone</label>
                  <select className="form-control" {...register('zoneId')}>
                    <option value="">Any Zone</option>
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
                <input type="text" className="form-control" placeholder="Optional internal notes" {...register('notes')} />
              </div>
              <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create & Notify Collector'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail/Chat Modal */}
      {detail && (
        <AssignmentDetail
          assignment={detail}
          currentUserId={currentUser?.id}
          onClose={() => setDetail(null)}
          onRefresh={() => fetchDetail(detail.id).catch(() => setDetail(null))}
        />
      )}
    </div>
  );
}
