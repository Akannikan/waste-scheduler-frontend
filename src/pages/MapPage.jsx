import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MdSearch, MdLocationOn, MdPhone, MdAccessTime, MdFilterList } from 'react-icons/md';
import { getCenters } from '../api';
import { PageLoading } from '../components/common/LoadingSkeleton';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColors = { plastic: '#1976D2', paper: '#FFA726', glass: '#66BB6A', metal: '#78909C', organic: '#8D6E63', 'e-waste': '#7E57C2', hazardous: '#EF5350' };

function createColorIcon(color) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${color};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    className: '',
  });
}

function RecenterButton({ center }) {
  const map = useMap();
  return (
    <button
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,0.2)', fontSize: 12 }}
      onClick={() => map.setView(center, 12)}
    >
      📍 Recenter
    </button>
  );
}

const DEFAULT_CENTER = [40.7128, -74.006]; // New York as default

export default function MapPage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    if (typeFilter) params.type = typeFilter;
    getCenters(params)
      .then((res) => setCenters(res.data.centers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const filtered = centers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recycling Center Map</h1>
          <p className="page-subtitle">Find nearby recycling centers and waste collection facilities.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* Sidebar list */}
        <div>
          {/* Filters */}
          <div className="card mb-3" style={{ padding: '12px 16px' }}>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: '1 1 160px' }}>
                <span className="input-icon"><MdSearch /></span>
                <input type="text" className="form-control" placeholder="Search centers..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="form-control" style={{ flex: '0 1 150px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {Object.keys(categoryColors).map((t) => (
                  <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
            {filtered.length === 0 ? (
              <div className="card text-center text-muted" style={{ padding: 24 }}>No centers found.</div>
            ) : (
              filtered.map((center) => (
                <div
                  key={center.id}
                  className="card"
                  style={{ cursor: 'pointer', border: selected?.id === center.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', padding: 14 }}
                  onClick={() => setSelected(center)}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{center.name}</div>
                  <div className="flex items-center gap-1 text-muted text-sm mb-2">
                    <MdLocationOn size={14} /> {center.address}
                  </div>
                  {center.phone && (
                    <div className="flex items-center gap-1 text-muted text-sm mb-2">
                      <MdPhone size={14} /> {center.phone}
                    </div>
                  )}
                  {center.openingHours && (
                    <div className="flex items-center gap-1 text-muted text-sm mb-2">
                      <MdAccessTime size={14} /> {center.openingHours}
                    </div>
                  )}
                  {center.acceptedTypes?.length > 0 && (
                    <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                      {center.acceptedTypes.map((t) => (
                        <span
                          key={t}
                          className="badge"
                          style={{ background: `${categoryColors[t] || '#ccc'}20`, color: categoryColors[t] || '#666', fontSize: 10 }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div>
          <div className="map-container">
            <MapContainer
              center={selected ? [selected.latitude, selected.longitude] : DEFAULT_CENTER}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((center) => (
                <Marker
                  key={center.id}
                  position={[center.latitude, center.longitude]}
                  icon={createColorIcon(center.acceptedTypes?.[0] ? categoryColors[center.acceptedTypes[0]] || '#2E7D32' : '#2E7D32')}
                  eventHandlers={{ click: () => setSelected(center) }}
                >
                  <Popup>
                    <strong>{center.name}</strong><br />
                    {center.address}<br />
                    {center.phone && <><MdPhone size={12} /> {center.phone}<br /></>}
                    {center.openingHours && <><MdAccessTime size={12} /> {center.openingHours}</>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {selected && (
            <div className="card mt-3" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <h4 style={{ marginBottom: 8 }}>{selected.name}</h4>
              <p className="text-muted text-sm mb-2">📍 {selected.address}</p>
              {selected.phone && <p className="text-muted text-sm mb-2">📞 {selected.phone}</p>}
              {selected.openingHours && <p className="text-muted text-sm mb-2">🕐 {selected.openingHours}</p>}
              {selected.acceptedTypes?.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>ACCEPTS</span>
                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {selected.acceptedTypes.map((t) => (
                      <span key={t} className="badge" style={{ background: `${categoryColors[t] || '#ccc'}20`, color: categoryColors[t] || '#666', textTransform: 'capitalize' }}>
                        {t.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
