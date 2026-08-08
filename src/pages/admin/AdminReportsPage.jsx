import { useEffect, useState } from 'react';
import { MdReport, MdClose } from 'react-icons/md';
import { getReports, updateReport } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const typeLabel = { missed_pickup: 'Missed Pickup', illegal_dumping: 'Illegal Dumping', damaged_bin: 'Damaged Bin', other: 'Other' };

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: '', adminNotes: '' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports({ status: statusFilter || undefined, limit: 50 });
      setReports(res.data.reports || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const openReport = (r) => {
    setSelected(r);
    setForm({ status: r.status, adminNotes: r.adminNotes || '' });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateReport(selected.id, { status: form.status, adminNotes: form.adminNotes });
      toast.success('Report updated');
      setSelected(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Citizen Reports</h1>
          <p className="page-subtitle">Review, assign, and resolve submitted issues.</p>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <select className="form-control" style={{ maxWidth: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <SkeletonTable /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={<MdReport />} title="No reports" /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Reported By</th><th>Type</th><th>Description</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>#{r.id}</td>
                    <td style={{ fontWeight: 600, fontSize: 14 }}>{r.reporter?.name}</td>
                    <td><span className="badge badge-orange">{typeLabel[r.type] || r.type}</span></td>
                    <td style={{ maxWidth: 240 }}><p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{r.description}</p></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{r.address || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openReport(r)}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report #{selected.id} — {typeLabel[selected.type]}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><MdClose /></button>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                Reported by <strong>{selected.reporter?.name}</strong> on {new Date(selected.createdAt).toLocaleDateString()}
              </div>
              <p style={{ fontSize: 14, margin: 0 }}>{selected.description}</p>
              {selected.address && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>📍 {selected.address}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea className="form-control" rows={3} placeholder="Add internal notes..." value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} />
            </div>

            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update Report'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
