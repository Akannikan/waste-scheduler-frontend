import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdClose, MdCheckCircle,
  MdWarning, MdRefresh,
} from 'react-icons/md';
import client from '../../api/client';
import { getUsers, getZones, getSchedules, getAssignments, deleteAssignment, createAssignment, updateAssignment } from '../../api';
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



/* ── Create Assignment Modal ── */
function CreateModal({ collectors, zones, schedules, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { priority: 'normal' } });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await createAssignment({
        title:       data.title,
        description: data.description,
        collectorId: Number(data.collectorId),
        scheduleId: data.scheduleId ? Number(data.scheduleId) : undefined,
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
              <label className="form-label">Pickup Schedule</label>
              <select className="form-control" {...register('scheduleId')}>
                <option value="">Standalone assignment</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id} disabled={Boolean(schedule.collectorId)}>
                    {schedule.title} · {new Date(schedule.pickupDate).toLocaleDateString('en-NG')}{schedule.collectorId ? ' · assigned' : ''}
                  </option>
                ))}
              </select>
            </div>
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
  const [schedules,    setSchedules]    = useState([]);
  const [showCreate,   setShowCreate]   = useState(false);

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  /* Fetch assignment list */
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



  const deleteAssignment_fn = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      toast.success('Deleted');
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  useEffect(() => {
    fetchList();
    getUsers({ role: 'collector', limit: 100 }).then(r => setCollectors(r.data.users || [])).catch(() => {});
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
    getSchedules({ limit: 100 }).then(r => setSchedules(r.data.schedules || [])).catch(() => {});
  }, [fetchList]);

  const pending    = assignments.filter(a => a.status === 'pending').length;
  const inProgress = assignments.filter(a => ['accepted','in_progress'].includes(a.status)).length;
  const completed  = assignments.filter(a => a.status === 'completed').length;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Assign duties to collectors.</p>
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
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,.12)', color: 'var(--color-secondary)' }}><MdCheckCircle size={22} /></div>
          <div className="stat-info"><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
          <div className="stat-info"><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
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
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => deleteAssignment_fn(a.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          collectors={collectors}
          zones={zones}
          schedules={schedules}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchList(); }}
        />
      )}
    </div>
  );
}
