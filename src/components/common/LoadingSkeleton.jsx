export function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div className="skeleton skeleton-title" style={{ width: '30%' }} />
      </div>
      <div style={{ padding: '0 20px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < rows - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div className="skeleton skeleton-text" style={{ flex: 2 }} />
            <div className="skeleton skeleton-text" style={{ flex: 1 }} />
            <div className="skeleton skeleton-text" style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatGrid() {
  return (
    <div className="stat-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="stat-card">
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" style={{ width: '50%' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  );
}
