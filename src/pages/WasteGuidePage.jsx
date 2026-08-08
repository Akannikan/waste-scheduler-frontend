import { useState, useEffect } from 'react';
import { MdSearch, MdRecycling, MdDeleteSweep } from 'react-icons/md';
import { searchGuide, getCategories } from '../api';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function WasteGuidePage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.categories || [])).catch(() => {});
    // Load initial items
    loadItems('');
  }, []);

  const loadItems = async (q) => {
    setLoading(true);
    try {
      const res = await searchGuide(q);
      setItems(res.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearched(true);
    const timer = setTimeout(() => loadItems(val), 350);
    return () => clearTimeout(timer);
  };

  const categoryColor = (slug) => categories.find((c) => c.slug === slug)?.color || '#ccc';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Waste Guide</h1>
          <p className="page-subtitle">Search any item to learn how to dispose of it correctly.</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="card mb-6" style={{ padding: '20px 24px' }}>
        <div className="input-group" style={{ maxWidth: 560 }}>
          <span className="input-icon"><MdSearch size={20} /></span>
          <input
            type="text"
            className="form-control"
            placeholder='Search — e.g. "plastic bottle", "cardboard", "phone"...'
            value={query}
            onChange={handleSearch}
            style={{ fontSize: 16, padding: '12px 12px 12px 44px' }}
          />
        </div>
        <p className="form-hint mt-2">Try searching by item name, material type, or disposal method.</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="btn btn-ghost btn-sm"
            style={{ border: `1.5px solid ${cat.color}`, color: cat.color, fontWeight: 600 }}
            onClick={() => { setQuery(cat.name); loadItems(cat.name); setSearched(true); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <PageLoading />
      ) : items.length === 0 && searched ? (
        <div className="card">
          <EmptyState
            icon={<MdDeleteSweep />}
            title="No results found"
            message={`We couldn't find disposal instructions for "${query}". Try a broader search term.`}
          />
        </div>
      ) : (
        <div className="grid-3">
          {items.map((item) => (
            <div key={item.id} className="card" style={{ borderTop: `3px solid ${categoryColor(item.categorySlug)}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{item.itemName}</h3>
                <span
                  className="badge"
                  style={{ background: `${categoryColor(item.categorySlug)}20`, color: categoryColor(item.categorySlug), textTransform: 'capitalize' }}
                >
                  {item.categorySlug.replace('-', ' ')}
                </span>
              </div>

              {item.aliases?.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  Also known as: {item.aliases.join(', ')}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: `${categoryColor(item.categorySlug)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🗑</span>
                  <span style={{ fontSize: 13 }}><strong>Bin:</strong> {item.binColor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>♻️</span>
                  <span style={{ fontSize: 13 }}><strong>How:</strong> {item.disposalMethod}</span>
                </div>
                {item.specialNotes && (
                  <div style={{ marginTop: 4, padding: '8px 10px', background: 'rgba(255,152,0,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-accent)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>⚠️ {item.specialNotes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* General tips */}
      <div className="card mt-6">
        <h3 className="card-title mb-4"><MdRecycling style={{ marginRight: 8, verticalAlign: 'middle' }} />General Recycling Tips</h3>
        <div className="grid-2" style={{ gap: 12 }}>
          {[
            { tip: 'Always rinse containers before placing them in the recycling bin.', icon: '💧' },
            { tip: 'Flatten cardboard boxes to save space in the recycling bin.', icon: '📦' },
            { tip: 'Never put plastic bags in the recycling bin — drop them off at supermarkets.', icon: '🛍️' },
            { tip: 'Remove food residue from containers — contaminated items cannot be recycled.', icon: '🍽️' },
            { tip: 'Electronic waste should always go to a designated e-waste facility.', icon: '💻' },
            { tip: 'Hazardous materials like paint and chemicals should never go in regular bins.', icon: '⚠️' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
