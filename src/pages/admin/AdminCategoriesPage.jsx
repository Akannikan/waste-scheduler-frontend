import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCategory } from 'react-icons/md';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import { PageLoading } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', color: '#2E7D32', binColor: '', collectionDay: '', description: '' });

  const fetchCats = async () => {
    setLoading(true);
    try { const res = await getCategories(); setCategories(res.data.categories || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', color: '#2E7D32', binColor: '', collectionDay: '', description: '' });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, color: c.color, binColor: c.binColor, collectionDay: c.collectionDay || '', description: c.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.binColor) { toast.error('Name, slug and bin color are required'); return; }
    setSaving(true);
    try {
      if (editing) { await updateCategory(editing.id, form); toast.success('Category updated'); }
      else { await createCategory(form); toast.success('Category created'); }
      setShowModal(false);
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await deleteCategory(id); toast.success('Deleted'); fetchCats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Waste Categories</h1>
          <p className="page-subtitle">Manage the types of waste collected in your system.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd /> New Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdCategory />} title="No categories" action={<button className="btn btn-primary" onClick={openCreate}><MdAdd /> Create one</button>} />
        </div>
      ) : (
        <div className="grid-3">
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ borderTop: `4px solid ${cat.color}` }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: cat.color }} />
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(cat)}><MdEdit size={16} /></button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(cat.id)}><MdDelete size={16} /></button>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{cat.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{cat.description || '—'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12 }}>🗑 <strong>Bin:</strong> {cat.binColor}</span>
                {cat.collectionDay && <span style={{ fontSize: 12 }}>📅 <strong>Collection:</strong> {cat.collectionDay}</span>}
                <span style={{ fontSize: 12 }}>🔖 <strong>Slug:</strong> {cat.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Plastic" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slug *</label>
                <input type="text" className="form-control" placeholder="e.g. plastic" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
            </div>
            <div className="grid-2 mt-2" style={{ gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 40, height: 38, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer' }} />
                  <input type="text" className="form-control" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bin Color *</label>
                <input type="text" className="form-control" placeholder="e.g. Blue Bin" value={form.binColor} onChange={e => setForm(f => ({ ...f, binColor: e.target.value }))} />
              </div>
            </div>
            <div className="form-group mt-2">
              <label className="form-label">Collection Day</label>
              <input type="text" className="form-control" placeholder="e.g. Tuesday, Monthly — First Saturday" value={form.collectionDay} onChange={e => setForm(f => ({ ...f, collectionDay: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
