import { useEffect, useState, useCallback } from 'react';
import { MdClose, MdRefresh, MdAssignment } from 'react-icons/md';
import { getAssignments, updateAssignment } from '../../api';
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


/* ── Main Page ── */
export default function CollectorAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAssignments();
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load assignments';
      toast.error(errorMsg);
    } finally { setLoading(false); }
  }, []);

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdatingIds(prev => new Set(prev).add(assignmentId));
    try {
      await updateAssignment(assignmentId, { status: newStatus });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingIds(prev => { const next = new Set(prev); next.delete(assignmentId); return next; });
    }
  };



  useEffect(() => { fetchList(); }, [fetchList]);

  if (loading) return <PageLoading text="Loading assignments…" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assignments</h1>
          <p className="page-subtitle">Duties assigned by admin. Update your assignment status here.</p>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={fetchList} title="Refresh"><MdRefresh size={18} /></button>
      </div>



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
            return (
              <div
                key={a.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${PRIORITY_COLORS[a.priority]}`,
                  transition: 'box-shadow .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</span>
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

                    {/* Status action buttons */}
                    {NEXT_ACTIONS[a.status]?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {NEXT_ACTIONS[a.status].map(action => (
                          <button
                            key={action.status}
                            className={`btn ${action.style} btn-sm`}
                            disabled={updatingIds.has(a.id)}
                            onClick={() => handleStatusChange(a.id, action.status)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
