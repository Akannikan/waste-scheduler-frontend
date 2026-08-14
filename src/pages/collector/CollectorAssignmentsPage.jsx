import { useEffect, useState, useCallback } from 'react';
import { MdMessage, MdSend, MdClose, MdCheckCircle, MdPending } from 'react-icons/md';
import client from '../../api/client';
import { PageLoading } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = { low: '#888', normal: '#1976D2', high: '#FF9800', urgent: '#D32F2F' };
const STATUS_COLORS = { pending: 'badge-orange', accepted: 'badge-blue', in_progress: 'badge-blue', completed: 'badge-green', rejected: 'badge-red' };

function AssignmentChat({ assignment, onClose, onRefresh, currentUserId }) {
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
      toast.success(`Updated to ${status.replace('_', ' ')}`);
      onRefresh();
    } catch { toast.error('Failed'); }
    finally { setUpdating(false); }
  };

  const nextStatuses = {
    pending: ['accepted', 'rejected'],
    accepted: ['in_progress'],
    in_progress: ['completed'],
  };

  const available = nextStatuses[assignment.status] || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{assignment.title}</h3>
            <span className={`badge ${STATUS_COLORS[assignment.status]}`} style={{ textTransform: 'capitalize', marginTop: 4 }}>
              {assignment.status.replace('_', ' ')}
            </span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>

        {/* Description */}
        <div style={{ background: 'var(--color-surface-2)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{assignment.description}</p>
          {assignment.dueDate && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-accent)', fontWeight: 600 }}>
              ⚠️ Due: {new Date(assignment.dueDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>

        {/* Status actions */}
        {available.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Update Status</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {available.map(s => (
                <button key={s} className={`btn ${s === 'completed' ? 'btn-primary' : s === 'rejected' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                  disabled={updating} onClick={() => updateStatus(s)} style={{ textTransform: 'capitalize' }}>
                  {s === 'completed' ? '✅ ' : s === 'accepted' ? '👍 ' : s === 'rejected' ? '❌ ' : '🔄 '}{s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
          Chat with Admin
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto', marginBottom: 12, padding: '4px 0' }}>
          {assignment.messages?.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No messages yet. Ask a question or provide an update!</p>
          )}
          {assignment.messages?.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? 'var(--color-primary)' : 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {msg.sender?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--color-primary)' : 'var(--color-surface-2)', color: isMe ? '#fff' : 'var(--color-text)', fontSize: 13 }}>
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

        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" className="form-control" placeholder="Message admin..." value={msgText}
            onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !msgText.trim()}><MdSend /></button>
        </div>
      </div>
    </div>
  );
}

export default function CollectorAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [currentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try { const r = await client.get('/assignments'); setAssignments(r.data.assignments || []); }
    catch { } finally { setLoading(false); }
  }, []);

  const fetchDetail = async (id) => {
    const r = await client.get(`/assignments/${id}`);
    setSelected(r.data.assignment);
  };

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  if (loading) return <PageLoading />;

  const unread = assignments.filter(a => a.unreadMessages > 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assignments</h1>
          <p className="page-subtitle">View assigned duties and communicate with admin.</p>
        </div>
      </div>

      {unread.length > 0 && (
        <div className="alert alert-warning mb-4">
          💬 You have <strong>{unread.length} assignment{unread.length > 1 ? 's' : ''}</strong> with unread messages.
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdPending />} title="No assignments yet" message="Your admin will assign duties here. You'll get a notification when something is assigned to you." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${PRIORITY_COLORS[a.priority]}`, cursor: 'pointer' }} onClick={() => fetchDetail(a.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{a.title}</h3>
                    {a.unreadMessages > 0 && <span className="badge badge-red">{a.unreadMessages} new</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>{a.description?.slice(0, 120)}...</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_COLORS[a.status]}`} style={{ textTransform: 'capitalize' }}>{a.status.replace('_', ' ')}</span>
                    <span className="badge" style={{ background: `${PRIORITY_COLORS[a.priority]}20`, color: PRIORITY_COLORS[a.priority], textTransform: 'capitalize' }}>{a.priority}</span>
                    {a.dueDate && <span className="badge badge-orange">Due {new Date(a.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  <MdMessage size={14} /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <AssignmentChat
          assignment={selected}
          currentUserId={currentUser?.id}
          onClose={() => setSelected(null)}
          onRefresh={() => fetchDetail(selected.id).catch(() => setSelected(null))}
        />
      )}
    </div>
  );
}
