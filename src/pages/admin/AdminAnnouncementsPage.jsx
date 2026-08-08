import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdAnnouncement } from 'react-icons/md';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' });

  const fetchData = async () => {
    setLoading(true);
    try { const res = await getAnnouncements({ limit: 50 }); setItems(res.data.announcements || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', message: '', audience: 'all' }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ title: a.title, message: a.message, audience: a.audience }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.message) { toast.error('Title and message are required'); return; }
    setSaving(true);
    try {
      if (editing) { await updateAnnouncement(editing.id, form); toast.success('Announcement updated'); }
      else { await createAnnouncement(form); toast.success('Announcement published'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try { await deleteAnnouncement(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const audienceLabel = { all: 'Everyone', residents: 'Residents', collectors: 'Collectors', admins: 'Admins' };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Announcements</h1><p className="page-subtitle">Publish updates and notices to your community.</p></div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd /> New Announcement</button>
      </div>

      {loading ? (
        <div className="grid-2">{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
      ) : items.length === 0 ? (
        <div className="card"><EmptyState icon={<MdAnnouncement />} title="No announcements" action={<button className="btn btn-primary" onClick={openCreate}><MdAdd /> Create one</button>} /></div>
      ) : (
        <div className="grid-2">
          {items.map(a => (
            <div key={a.id} className="card" style={{ borderTop: '3px solid var(--color-primary)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-blue">{audienceLabel[a.audience] || a.audience}</span>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(a)}><MdEdit size={15} /></button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(a.id)}><MdDelete size={15} /></button>
                </div>
              </div>
              <h4 style={{ marginBottom: 8 }}>{a.title}</h4>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{a.message}</p>
              <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 10 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select className="form-control" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                <option value="all">Everyone</option>
                <option value="residents">Residents</option>
                <option value="collectors">Collectors</option>
                <option value="admins">Admins</option>
              </select>
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Publishing...' : editing ? 'Save' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
