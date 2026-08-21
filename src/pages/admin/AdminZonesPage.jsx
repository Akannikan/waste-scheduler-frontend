import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdLocationCity } from 'react-icons/md';
import { getZones, createZone, updateZone, deleteZone } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import { PageLoading } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', state: 'Kwara', lga: '' });

  const fetchZones = async () => {
    setLoading(true);
    try { const res = await getZones(); setZones(res.data.zones || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '', state: 'Kwara', lga: '' }); setShowModal(true); };
  const openEdit = (z) => { setEditing(z); setForm({ name: z.name, code: z.code, description: z.description || '', state: z.state || '', lga: z.lga || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Name and code are required'); return; }
    setSaving(true);
    try {
      if (editing) { await updateZone(editing.id, form); toast.success('Zone updated'); }
      else { await createZone(form); toast.success('Zone created'); }
      setShowModal(false);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save zone');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone? Schedules linked to it may be affected.')) return;
    try { await deleteZone(id); toast.success('Zone deleted'); fetchZones(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Zone Management</h1>
          <p className="page-subtitle">Define and manage waste collection zones.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd /> New Zone</button>
      </div>

      {zones.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdLocationCity />} title="No zones yet" message="Create your first collection zone." action={<button className="btn btn-primary" onClick={openCreate}><MdAdd /> Create Zone</button>} />
        </div>
      ) : (
        <div className="grid-3">
          {zones.map(z => (
            <div key={z.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-green">{z.code}</span>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(z)}><MdEdit size={16} /></button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(z.id)}><MdDelete size={16} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{z.name}</h3>
              {(z.state || z.lga) && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 6px' }}>{[z.state, z.lga].filter(Boolean).join(' · ')}</p>}
              {z.description && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{z.description}</p>}
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-light)' }}>
                {z.isActive ? '✅ Active' : '❌ Inactive'}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Zone' : 'New Zone'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Zone Name *</label>
              <input type="text" className="form-control" placeholder="e.g. North District 1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Zone Code *</label>
              <input type="text" className="form-control" placeholder="e.g. ZONE-N1" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              <p className="form-hint">Short unique identifier — uppercase letters and dashes.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Describe the zone coverage..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-control" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Kwara" />
              </div>
              <div className="form-group">
                <label className="form-label">LGA</label>
                <input type="text" className="form-control" value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value }))} placeholder="e.g. Ilorin West" />
              </div>
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Zone'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
