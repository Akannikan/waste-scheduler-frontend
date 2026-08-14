import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MdSearch, MdLocationOn, MdPhone, MdAccessTime, MdMyLocation, MdFilterList } from 'react-icons/md';
import { FaRecycle } from 'react-icons/fa';
import { getCenters } from '../api';
import { PageLoading } from '../components/common/LoadingSkeleton';

// Fix Leaflet icon for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CAT_COLORS = { plastic: '#1976D2', paper: '#FFA726', glass: '#66BB6A', metal: '#78909C', organic: '#8D6E63', 'e-waste': '#7E57C2', hazardous: '#EF5350' };

// Nigeria-specific recycling centers (hardcoded as fallback + DB centers)
const NIGERIA_CENTERS = [
  { id: 'n1', name: 'LAWMA Ikeja Collection Hub', address: 'Alausa, Ikeja, Lagos', latitude: 6.5966, longitude: 3.3436, phone: '+234-1-279-5100', state: 'Lagos', lga: 'Ikeja', openingHours: 'Mon–Sat 7am–5pm', acceptedTypes: ['plastic', 'paper', 'glass', 'metal', 'organic'] },
  { id: 'n2', name: 'LAWMA Ojota Transfer Station', address: 'Ojota, Lagos', latitude: 6.5938, longitude: 3.3833, phone: '+234-1-279-5101', state: 'Lagos', lga: 'Kosofe', openingHours: 'Mon–Fri 6am–6pm', acceptedTypes: ['plastic', 'organic', 'paper'] },
  { id: 'n3', name: 'EkoRecycle VI', address: 'Victoria Island, Lagos', latitude: 6.4281, longitude: 3.4219, phone: '+234-803-012-3456', state: 'Lagos', lga: 'Eti-Osa', openingHours: 'Mon–Sat 8am–6pm', acceptedTypes: ['e-waste', 'plastic', 'glass'] },
  { id: 'n4', name: 'LAWMA Agege Center', address: 'Agege, Lagos State', latitude: 6.6175, longitude: 3.3241, phone: '+234-1-279-5102', state: 'Lagos', lga: 'Agege', openingHours: 'Mon–Sat 7am–5pm', acceptedTypes: ['plastic', 'metal', 'paper'] },
  { id: 'n5', name: 'Abeokuta Recycling Hub', address: 'Ibara, Abeokuta, Ogun State', latitude: 7.1557, longitude: 3.3451, phone: '+234-807-123-4567', state: 'Ogun', lga: 'Abeokuta South', openingHours: 'Mon–Fri 8am–4pm', acceptedTypes: ['plastic', 'paper', 'metal'] },
  { id: 'n6', name: 'FCT AEPB Maitama', address: 'Maitama District, Abuja FCT', latitude: 9.0789, longitude: 7.4873, phone: '+234-9-234-5678', state: 'FCT', lga: 'Municipal Area Council', openingHours: 'Mon–Fri 8am–5pm', acceptedTypes: ['e-waste', 'hazardous', 'plastic'] },
  { id: 'n7', name: 'Abuja E-Waste Jabi', address: 'Jabi, Abuja FCT', latitude: 9.0579, longitude: 7.4951, phone: '+234-803-987-6543', state: 'FCT', lga: 'Municipal Area Council', openingHours: 'Tue–Sun 9am–4pm', acceptedTypes: ['e-waste', 'metal', 'glass'] },
  { id: 'n8', name: 'GreenPH Trans Amadi', address: 'Trans Amadi Industrial, Port Harcourt', latitude: 4.8396, longitude: 7.0134, phone: '+234-807-111-2222', state: 'Rivers', lga: 'Obio-Akpor', openingHours: 'Mon–Fri 8am–5pm', acceptedTypes: ['plastic', 'paper', 'metal', 'organic'] },
  { id: 'n9', name: 'Kano REMASAB Center', address: 'Bompai Industrial Estate, Kano', latitude: 12.0022, longitude: 8.5920, phone: '+234-64-123-456', state: 'Kano', lga: 'Kano Municipal', openingHours: 'Mon–Fri 7am–4pm', acceptedTypes: ['plastic', 'paper', 'organic'] },
  { id: 'n10', name: 'Ibadan OYOWMA Hub', address: 'Ring Road, Ibadan, Oyo State', latitude: 7.3775, longitude: 3.9470, phone: '+234-2-312-3456', state: 'Oyo', lga: 'Ibadan Municipal', openingHours: 'Mon–Sat 7am–5pm', acceptedTypes: ['organic', 'plastic', 'glass'] },
  { id: 'n11', name: 'Enugu State Recycling', address: 'Independence Layout, Enugu', latitude: 6.4483, longitude: 7.5137, phone: '+234-42-123-456', state: 'Enugu', lga: 'Enugu North', openingHours: 'Mon–Fri 8am–4pm', acceptedTypes: ['plastic', 'paper', 'metal'] },
  { id: 'n12', name: 'Benin BSWMA Center', address: 'Airport Road, Benin City, Edo', latitude: 6.3378, longitude: 5.6269, phone: '+234-52-234-567', state: 'Edo', lga: 'Oredo', openingHours: 'Mon–Sat 7am–5pm', acceptedTypes: ['plastic', 'organic', 'glass', 'metal'] },
  { id: 'n13', name: 'Warri Delta Recycling', address: 'Effurun, Warri, Delta State', latitude: 5.5323, longitude: 5.7432, phone: '+234-803-444-5555', state: 'Delta', lga: 'Uvwie', openingHours: 'Mon–Fri 8am–4pm', acceptedTypes: ['plastic', 'paper'] },
  { id: 'n14', name: 'Kaduna KASUPDA Center', address: 'Ungwan Rimi, Kaduna', latitude: 10.5174, longitude: 7.4383, phone: '+234-62-123-456', state: 'Kaduna', lga: 'Kaduna North', openingHours: 'Mon–Fri 8am–5pm', acceptedTypes: ['plastic', 'metal', 'e-waste'] },
  { id: 'n15', name: 'LAWMA Surulere Station', address: 'Aguda, Surulere, Lagos', latitude: 6.4963, longitude: 3.3536, phone: '+234-1-279-5103', state: 'Lagos', lga: 'Surulere', openingHours: 'Mon–Sat 6am–6pm', acceptedTypes: ['plastic', 'organic', 'paper', 'glass'] },
];

// Nigeria center and bounds
const NIGERIA_CENTER = [9.0820, 8.6753];
const NIGERIA_BOUNDS = [[4.27, 2.67], [13.89, 14.68]];

function createMarkerIcon(color) {
  return L.divIcon({
    html: `<div style="width:26px;height:26px;background:${color};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 26], className: '',
  });
}

export default function MapPage() {
  const [dbCenters, setDbCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCenters().then(r => setDbCenters(r.data.centers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Merge DB centers with Nigerian fallback centers
  const allCenters = [
    ...NIGERIA_CENTERS,
    ...dbCenters.filter(d => !NIGERIA_CENTERS.find(n => n.latitude === d.latitude && n.longitude === d.longitude)),
  ];

  const STATES = [...new Set(allCenters.map(c => c.state).filter(Boolean))].sort();

  const filtered = allCenters.filter(c => {
    if (typeFilter && !c.acceptedTypes?.includes(typeFilter)) return false;
    if (stateFilter && c.state !== stateFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recycling Center Map 🇳🇬</h1>
          <p className="page-subtitle">Find recycling centers and waste collection facilities across Nigeria.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '12px 16px' }}>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: '1 1 200px' }}>
            <span className="input-icon"><MdSearch /></span>
            <input type="text" className="form-control" placeholder="Search centers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ flex: '0 1 140px' }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ flex: '0 1 150px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {Object.keys(CAT_COLORS).map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>)}
          </select>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{filtered.length} center{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* Sidebar list */}
        <div style={{ maxHeight: 580, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {filtered.length === 0 ? (
            <div className="card text-center text-muted" style={{ padding: 24 }}>No centers match your filters.</div>
          ) : filtered.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', padding: 14, border: selected?.id === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', transition: 'all 0.15s' }}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
              {c.state && <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>📍 {c.state}{c.lga ? ` · ${c.lga}` : ''}</div>}
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{c.address}</div>
              {c.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>📞 {c.phone}</div>}
              {c.openingHours && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>🕐 {c.openingHours}</div>}
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                {c.acceptedTypes?.map(t => (
                  <span key={t} className="badge" style={{ background: `${CAT_COLORS[t] || '#ccc'}20`, color: CAT_COLORS[t] || '#666', fontSize: 10, textTransform: 'capitalize' }}>
                    {t.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div>
          <div className="map-container" style={{ height: 540 }}>
            <MapContainer
              center={selected ? [selected.latitude, selected.longitude] : NIGERIA_CENTER}
              zoom={selected ? 13 : 6}
              maxBounds={NIGERIA_BOUNDS}
              minZoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Nigeria boundary highlight */}
              <Circle center={NIGERIA_CENTER} radius={800000} pathOptions={{ color: '#2E7D32', fillColor: '#2E7D32', fillOpacity: 0.04, weight: 1, dashArray: '6' }} />

              {filtered.map(center => (
                <Marker
                  key={center.id}
                  position={[center.latitude, center.longitude]}
                  icon={createMarkerIcon(center.acceptedTypes?.[0] ? CAT_COLORS[center.acceptedTypes[0]] || '#2E7D32' : '#2E7D32')}
                  eventHandlers={{ click: () => setSelected(center) }}
                >
                  <Popup maxWidth={280}>
                    <div style={{ fontFamily: 'Inter,sans-serif' }}>
                      <strong style={{ fontSize: 14 }}>{center.name}</strong><br />
                      <span style={{ fontSize: 12, color: '#666' }}>{center.address}</span><br />
                      {center.phone && <span style={{ fontSize: 12 }}>📞 {center.phone}<br /></span>}
                      {center.openingHours && <span style={{ fontSize: 12 }}>🕐 {center.openingHours}</span>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="card mt-3" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>WASTE TYPE LEGEND</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(CAT_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => setTypeFilter(typeFilter === type ? '' : type)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, outline: typeFilter === type ? `2px solid ${color}` : 'none', outlineOffset: 2 }} />
                  <span style={{ fontSize: 11, textTransform: 'capitalize', color: typeFilter === type ? color : 'var(--color-text-muted)', fontWeight: typeFilter === type ? 700 : 400 }}>
                    {type.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
