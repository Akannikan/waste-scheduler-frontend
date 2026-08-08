import { useEffect, useState } from 'react';
import { MdAdd, MdDelete, MdEdit, MdClose } from 'react-icons/md';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getCategories, getZones } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', zoneId: '', categoryId: '', pickupDate: '', recurrence: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, c, z] = await Promise.all([getSchedules({ limit: 50 }), getCategories(), getZones()]);
      setSchedules(s.data.schedules || []);
      setCategories(c.data.categories || []);
      setZones(z.data.zones || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', zoneId: '', categoryId: '', pickupDate: '', recurrence: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title,
      zoneId: s.zoneId,
      categoryId: s.categoryId,
      pickupDate: new Date(s.pickupDate).toISOString().slice(0, 16),
      recurrence: s.recurrence || '',
      notes: s.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.zoneId || !form.categoryId || !form.pickupDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, pickupDate: new Date(form.pickupDate).toISOString() };
      if (editing) { await updateSchedule(editing.id, payload); toast.success('Schedule updated'); }
      else { await createSchedule(payload); toast.success('Schedule created'); }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try { await deleteSchedule(id); toast.success('Deleted'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Schedule Management</h1><p className="page-subtitle">Create and manage pickup schedules across zones.</p></div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd /> New Schedule</button>
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Title</th><th>Zone</th><th>Category</th><th>Pickup Date</th><th>Recurrence</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td style={{ fontSize: 13 }}>{s.zone?.name}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.category?.color }} />
                        <span style={{ fontSize: 13 }}>{s.category?.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(s.pickupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td>{s.recurrence ? <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s.recurrence}</span> : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>One-time</span>}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(s)}><MdEdit size={15} /></button>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(s.id)}><MdDelete size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Schedule' : 'New Schedule'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Zone *</label>
                <select className="form-control" value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}>
                  <option value="">Select zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group mt-2">
              <label className="form-label">Pickup Date & Time *</label>
              <input type="datetime-local" className="form-control" value={form.pickupDate} onChange={e => setForm(f => ({ ...f, pickupDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Recurrence</label>
              <select className="form-control" value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}>
                <option value="">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Schedule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
