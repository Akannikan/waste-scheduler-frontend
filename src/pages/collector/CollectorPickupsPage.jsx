import { useEffect, useState } from 'react';
import { MdCheckCircle, MdPending, MdClose } from 'react-icons/md';
import { getSchedules, completeSchedule } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function CollectorPickupsPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [formData, setFormData] = useState({ quantityKg: '', notes: '', proofImageUrl: '' });

  useEffect(() => {
    getSchedules({ status: 'scheduled', limit: 50 })
      .then((res) => setSchedules(res.data.schedules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCompleteModal = (id) => {
    setActiveId(id);
    setFormData({ quantityKg: '', notes: '', proofImageUrl: '' });
    setShowModal(true);
  };

  const handleComplete = async () => {
    setCompleting(activeId);
    try {
      await completeSchedule(activeId, {
        quantityKg: formData.quantityKg ? Number(formData.quantityKg) : undefined,
        notes: formData.notes,
        proofImageUrl: formData.proofImageUrl || undefined,
      });
      toast.success('Pickup marked as completed');
      setSchedules((s) => s.filter((item) => item.id !== activeId));
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Pickups</h1>
          <p className="page-subtitle">Mark pickups as completed and record collection details.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : schedules.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdCheckCircle />} title="All caught up!" message="No pending pickups assigned." />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Zone</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.category?.color }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.category?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.category?.binColor}</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.zone?.name}</td>
                    <td>{new Date(s.pickupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openCompleteModal(s.id)}
                        disabled={completing === s.id}
                      >
                        <MdCheckCircle /> Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Collection</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Collected (kg)</label>
              <input type="number" min="0" className="form-control" placeholder="e.g. 45" value={formData.quantityKg} onChange={(e) => setFormData((f) => ({ ...f, quantityKg: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Proof Image URL (optional)</label>
              <input type="url" className="form-control" placeholder="https://..." value={formData.proofImageUrl} onChange={(e) => setFormData((f) => ({ ...f, proofImageUrl: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Any issues or observations..." value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleComplete} disabled={completing}>
                <MdCheckCircle /> {completing ? 'Saving...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
