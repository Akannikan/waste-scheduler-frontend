import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdLocationOn,
  MdPhone, MdAccessTime, MdSearch, MdMap,
} from 'react-icons/md';
import { getCenters, createCenter, updateCenter, deleteCenter, getZones } from '../../api';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

// Fix Leaflet icon for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WASTE_TYPES = ['plastic', 'paper', 'glass', 'metal', 'organic', 'e-waste', 'hazardous'];

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

// ── Center Form Modal ──────────────────────────────────────────
function CenterModal({ editing, zones, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(editing?.acceptedTypes || []);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: editing ? {
      name: editing.name,
      address: editing.address,
      latitude: editing.latitude,
      longitude: editing.longitude,
      phone: editing.phone || '',
      email: editing.email || '',
      website: editing.website || '',
      zoneId: editing.zoneId || '',
      state: editing.state || '',
      openingHours: editing.openingHours || '',
    } : {},
  });

  const toggleType = (t) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setValue('latitude', pos.coords.latitude.toFixed(6));
        setValue('longitude', pos.coords.longitude.toFixed(6));
        toast.success('Location captured');
      },
      () => toast.error('Could not get location')
    );
  };

  const onSubmit = async (data) => {
    if (selectedTypes.length === 0) {
      toast.error('Select at least one accepted waste type');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        zoneId: data.zoneId ? Number(data.zoneId) : undefined,
        state: data.state || undefined,
        openingHours: data.openingHours || undefined,
        acceptedTypes: selectedTypes,
      };
      if (editing) {
        await updateCenter(editing.id, payload);
        toast.success('Center updated');
      } else {
        await createCenter(payload);
        toast.success('Center created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save center');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 600, maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {editing ? 'Edit Recycling Center' : 'Add Recycling Center'}
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Center Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="e.g. LAWMA Ikeja Collection Hub"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input
              type="text"
              className={`form-control ${errors.address ? 'error' : ''}`}
              placeholder="Full address"
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          {/* State */}
          <div className="form-group">
            <label className="form-label">State</label>
            <select className="form-control" {...register('state')}>
              <option value="">Select state</option>
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Coordinates */}
          <div className="grid-2 mt-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Latitude *</label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.latitude ? 'error' : ''}`}
                placeholder="e.g. 6.5244"
                {...register('latitude', {
                  required: 'Latitude required',
                  min: { value: -90, message: 'Invalid' },
                  max: { value: 90, message: 'Invalid' },
                })}
              />
              {errors.latitude && <p className="form-error">{errors.latitude.message}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Longitude *</label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.longitude ? 'error' : ''}`}
                placeholder="e.g. 3.3792"
                {...register('longitude', {
                  required: 'Longitude required',
                  min: { value: -180, message: 'Invalid' },
                  max: { value: 180, message: 'Invalid' },
                })}
              />
              {errors.longitude && <p className="form-error">{errors.longitude.message}</p>}
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={getLocation}>
            <MdLocationOn size={14} /> Use My Location
          </button>

          {/* Contact */}
          <div className="grid-2 mt-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone</label>
              <input type="tel" className="form-control" placeholder="+234 800 000 0000" {...register('phone')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="center@example.com" {...register('email')} />
            </div>
          </div>

          {/* Website + Opening hours */}
          <div className="grid-2 mt-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Website</label>
              <input type="url" className="form-control" placeholder="https://..." {...register('website')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Opening Hours</label>
              <input type="text" className="form-control" placeholder="Mon–Fri 8am–5pm" {...register('openingHours')} />
            </div>
          </div>

          {/* Zone */}
          <div className="form-group mt-2">
            <label className="form-label">Collection Zone</label>
            <select className="form-control" {...register('zoneId')}>
              <option value="">No specific zone</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
            </select>
          </div>

          {/* Accepted waste types */}
          <div className="form-group">
            <label className="form-label">Accepted Waste Types *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {WASTE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '2px solid',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    background: selectedTypes.includes(t) ? 'var(--color-primary)' : 'transparent',
                    borderColor: selectedTypes.includes(t) ? 'var(--color-primary)' : 'var(--color-border)',
                    color: selectedTypes.includes(t) ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
            {selectedTypes.length === 0 && (
              <p className="form-hint" style={{ color: 'var(--color-danger)' }}>Select at least one type</p>
            )}
          </div>

          <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Center'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Map preview modal ──────────────────────────────────────────
function MapPreviewModal({ center, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{center.name}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>
        <div style={{ height: 340, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <MapContainer
            center={[center.latitude, center.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[center.latitude, center.longitude]}>
              <Popup>{center.name}<br />{center.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 14, margin: 0 }}>📍 {center.address}</p>
          {center.state && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>{center.state}</p>}
          {center.phone && <p style={{ fontSize: 13, margin: 0 }}>📞 {center.phone}</p>}
          {center.openingHours && <p style={{ fontSize: 13, margin: 0 }}>🕐 {center.openingHours}</p>}
          {center.acceptedTypes?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {center.acceptedTypes.map(t => (
                <span key={t} className="badge badge-green" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                  {t.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminCentersPage() {
  const [centers, setCenters] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mapPreview, setMapPreview] = useState(null);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCenters();
      setCenters(res.data.centers || []);
    } catch {
      toast.error('Failed to load centers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
  }, [fetchCenters]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCenter(id);
      toast.success('Center deleted');
      fetchCenters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setShowModal(true); };

  const states = [...new Set(centers.map(c => c.state).filter(Boolean))].sort();

  const filtered = centers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    const matchState = !stateFilter || c.state === stateFilter;
    return matchSearch && matchState;
  });

  const activeCount = centers.filter(c => c.isActive !== false).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recycling Centers</h1>
          <p className="page-subtitle">
            Manage all recycling and waste collection facilities across Nigeria.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <MdAdd /> Add Center
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)', fontSize: 22 }}>♻️</div>
          <div className="stat-info">
            <div className="stat-value">{centers.length}</div>
            <div className="stat-label">Total Centers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}>
            <MdLocationOn size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{states.length}</div>
            <div className="stat-label">States Covered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)', fontSize: 22 }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Centers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)', fontSize: 22 }}>📦</div>
          <div className="stat-info">
            <div className="stat-value">
              {[...new Set(centers.flatMap(c => c.acceptedTypes || []))].length}
            </div>
            <div className="stat-label">Waste Types Covered</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '12px 16px' }}>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: '1 1 220px' }}>
            <span className="input-icon"><MdSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search centers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ flex: '0 1 160px' }}
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {filtered.length} center{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<span style={{ fontSize: 48 }}>♻️</span>}
            title="No recycling centers found"
            message="Add your first recycling center to display it on the map for residents."
            action={
              <button className="btn btn-primary" onClick={openCreate}>
                <MdAdd /> Add Center
              </button>
            }
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Hours</th>
                  <th>Accepts</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </div>
                      {c.state && (
                        <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
                          {c.state}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.address}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 2, color: 'var(--color-text-light)' }}>
                        {c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {c.phone && <div>📞 {c.phone}</div>}
                      {c.email && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 150 }}>
                      {c.openingHours || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 180 }}>
                        {(c.acceptedTypes || []).slice(0, 3).map(t => (
                          <span
                            key={t}
                            className="badge badge-green"
                            style={{ fontSize: 10, textTransform: 'capitalize' }}
                          >
                            {t.replace('-', ' ')}
                          </span>
                        ))}
                        {(c.acceptedTypes || []).length > 3 && (
                          <span className="badge badge-grey" style={{ fontSize: 10 }}>
                            +{c.acceptedTypes.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {c.zone?.name || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                        {c.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-icon"
                          title="View on map"
                          onClick={() => setMapPreview(c)}
                        >
                          <MdMap size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Edit"
                          onClick={() => openEdit(c)}
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Delete"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(c.id, c.name)}
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <CenterModal
          editing={editing}
          zones={zones}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); fetchCenters(); }}
        />
      )}

      {/* Map preview */}
      {mapPreview && (
        <MapPreviewModal center={mapPreview} onClose={() => setMapPreview(null)} />
      )}
    </div>
  );
}
