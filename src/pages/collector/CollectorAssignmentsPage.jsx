import { useEffect, useState, useCallback } from 'react';
import { MdSend, MdClose, MdRefresh, MdAssignment } from 'react-icons/md';
import client from '../../api/client';
import { PageLoading } from '../../components/common/LoadingSkeleton';
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

/* ── Status step-machine: what actions can the collector take ── */
const NEXT_ACTIONS = {
  pending:     [{ status: 'accepted', label: '👍 Accept', style: 'btn-primary' }, { status: 'rejected', label: '❌ Decline', style: 'btn-danger' }],
  accepted:    [{ status: 'in_progress', label: '🔄 Start Work', style: 'btn-secondary' }],
  in_progress: [{ status: 'completed', label: '✅ Mark Complete', style: 'btn-primary' }],
  completed:   [],
  rejected:    [],
};

/* ── Chat panel ── */
function AssignmentChat({ assignment, currentUserId, onClose, onRefresh }) {
  const [text,      setText]      = useState('');
  const [sending,   setSending]   = useState(false);
  const [updating,  setUpdating]  = useState(false);

  const sendMsg = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await client.post(`/assignments/${assignment.id}/messages`, { message: trimmed });
      setText('');
      toast.success('Message sent to admin');
      onRefresh(assignment.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await client.put(`/assignments/${assignment.id}`, { status });
      toast.success(`Updated: ${status.replace('_', ' ')}`);
      onRefresh(assignment.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const actions = NEXT_ACTIONS[assignment.status] || [];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
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

      {/* Description + due */}
      <div style={{ padding: '12px 18px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
        <p style={{ margin: 0 }}>{assignment.description}</p>
        {assignment.dueDate && (
          <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--color-accent)' }}>
            ⏰ Due: {new Date(assignment.dueDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Status actions */}
      {actions.length > 0 && (
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
          {actions.map(a => (
            <button key={a.status} className={`btn ${a.style} btn-sm`} disabled={updating} onClick={() => changeStatus(a.status)}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(!assignment.messages || assignment.messages.length === 0) && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, padding: '24px 0' }}>
            No messages yet. Use the box below to ask a question or give an update.
          </div>
        )}
        {assignment.messages?.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: isMe ? 'var(--color-primary)' : 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {msg.sender?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ maxWidth: '73%' }}>
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
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Reply to admin…"
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

/* ── Main Page ── */
export default function CollectorAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeChat,  setActiveChat]  = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  }, []);

  const openChat = async (id) => {
    setLoadingChat(true);
    try {
      const res = await client.get(`/assignments/${id}`);
      setActiveChat(res.data.assignment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load chat');
    } finally { setLoadingChat(false); }
  };

  const refreshChat = async (id) => {
    try {
      const res = await client.get(`/assignments/${id}`);
      setActiveChat(res.data.assignment);
      fetchList();
    } catch { /* silent */ }
  };

  useEffect(() => { fetchList(); }, [fetchList]);

  if (loading) return <PageLoading text="Loading assignments…" />;

  const unread = assignments.filter(a => a.unreadMessages > 0);

  return (
    <div style={{ paddingRight: activeChat ? 416 : 0, transition: 'padding-right .25s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assignments</h1>
          <p className="page-subtitle">Duties assigned by admin. Click an assignment to chat and update status.</p>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={fetchList} title="Refresh"><MdRefresh size={18} /></button>
      </div>

      {/* Unread banner */}
      {unread.length > 0 && (
        <div className="alert alert-warning mb-4">
          💬 You have <strong>{unread.length}</strong> assignment{unread.length > 1 ? 's' : ''} with unread messages from admin.
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdAssignment style={{ fontSize: 48 }} />}
            title="No assignments yet"
            message="Your admin will send duties here. You'll get a notification when something is assigned to you."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.map(a => {
            const isActive = activeChat?.id === a.id;
            return (
              <div
                key={a.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${PRIORITY_COLORS[a.priority]}`,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(46,125,50,.04)' : 'var(--color-surface)',
                  transition: 'box-shadow .15s',
                }}
                onClick={() => openChat(a.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</span>
                      {a.unreadMessages > 0 && (
                        <span className="badge badge-red">{a.unreadMessages} new</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {a.description?.slice(0, 120)}{a.description?.length > 120 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${STATUS_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>
                        {a.status.replace('_', ' ')}
                      </span>
                      <span className="badge" style={{ background: `${PRIORITY_COLORS[a.priority]}18`, color: PRIORITY_COLORS[a.priority], textTransform: 'capitalize' }}>
                        {a.priority}
                      </span>
                      {a.dueDate && (
                        <span className="badge badge-orange">
                          Due {new Date(a.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        From: {a.admin?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                    disabled={loadingChat}
                    onClick={e => { e.stopPropagation(); openChat(a.id); }}
                  >
                    <MdSend size={13} /> Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat panel */}
      {loadingChat && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageLoading text="Loading chat…" />
        </div>
      )}
      {activeChat && !loadingChat && (
        <AssignmentChat
          assignment={activeChat}
          currentUserId={currentUser?.id}
          onClose={() => setActiveChat(null)}
          onRefresh={refreshChat}
        />
      )}
    </div>
  );
}
