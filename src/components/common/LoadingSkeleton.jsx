import { FaLeaf } from 'react-icons/fa';

// ── Branded loader ────────────────────────────────────────────
export function BinLoader({ size = 64, text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: '48px 24px',
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <div className="brand-loader" style={{ width: size, height: size, fontSize: size * 0.52 }}>
          <FaLeaf aria-hidden="true" />
        </div>
      </div>

      {text && (
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.3px',
          animation: 'loadingTextPulse 1.5s ease-in-out infinite',
        }}>
          {text}
        </div>
      )}

      <style>{`
        @keyframes loadingTextPulse {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Page-level full-screen loader ─────────────────────────────
export function PageLoading({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 340,
    }}>
      <BinLoader size={72} text={text} />
    </div>
  );
}

// ── Inline mini spinner (used in buttons) ─────────────────────
export function InlineSpinner() {
  return (
    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
  );
}

// ── Skeleton components ───────────────────────────────────────
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
          <div key={i} style={{
            display: 'flex', gap: 16, padding: '14px 0',
            borderBottom: i < rows - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
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
      {[1, 2, 3, 4].map(i => (
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
