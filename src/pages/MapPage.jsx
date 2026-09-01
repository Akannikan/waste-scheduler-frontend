import { useEffect, useState } from 'react';
import { MdSearch, MdLocationOn, MdPhone, MdAccessTime, MdMyLocation, MdFilterList } from 'react-icons/md';
import { FaRecycle } from 'react-icons/fa';
import { getCenters } from '../api';
import { PageLoading } from '../components/common/LoadingSkeleton';
import collectionRouteImage from '../../images/carl-campbell-stzGl8p5Vio-unsplash.jpg';

const CAT_COLORS = { plastic: '#1976D2', paper: '#FFA726', glass: '#66BB6A', metal: '#78909C', organic: '#8D6E63', 'e-waste': '#7E57C2', hazardous: '#EF5350' };

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

  const allCenters = dbCenters;

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
          <p className="page-subtitle">Find recycling centers and waste collection facilities, starting with Kwara State.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, position: 'relative', minHeight: 150 }}>
        <img src={collectionRouteImage} alt="Waste collection truck route" style={{ width: '100%', height: 170, objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '18px 22px', background: 'linear-gradient(transparent 25%, rgba(5,30,24,.78))', color: '#fff' }}>
          <strong style={{ fontSize: 15 }}>Find collection and recycling points near you.</strong>
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

      <div>
        {/* Sidebar list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {filtered.length === 0 ? (
            <div className="card text-center text-muted" style={{ padding: 24 }}>No centers match your filters.</div>
          ) : filtered.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', padding: 14, border: selected?.id === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', transition: 'all 0.15s' }}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
              {c.state && <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>📍 {c.state}</div>}
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
  );
}
