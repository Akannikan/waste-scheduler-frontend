/* ─────────────────────────────────────────────────────────────
   Loading components including the animated bin loader
───────────────────────────────────────────────────────────── */

// ── Animated Bin Loader ───────────────────────────────────────
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
        {/* Bin body */}
        <svg viewBox="0 0 64 72" width={size} height={size} style={{ display: 'block' }}>
          <style>{`
            @keyframes binLid {
              0%,100% { transform: rotate(0deg) translateX(-50%); }
              30%      { transform: rotate(-35deg) translateX(-50%); }
              60%      { transform: rotate(-35deg) translateX(-50%); }
            }
            @keyframes trashDrop {
              0%   { transform: translateY(-18px); opacity: 0; }
              40%  { opacity: 1; }
              70%  { transform: translateY(12px); opacity: 0.7; }
              100% { transform: translateY(24px); opacity: 0; }
            }
            @keyframes binBounce {
              0%,100% { transform: translateY(0); }
              50%     { transform: translateY(2px); }
            }
            .bin-body { animation: binBounce 1.2s ease-in-out infinite; }
            .bin-lid  { transform-origin: 50% 100%; animation: binLid 1.2s ease-in-out infinite; }
            .trash    { animation: trashDrop 1.2s ease-in-out infinite; }
          `}</style>

          {/* Trash item falling in */}
          <rect className="trash" x="26" y="2" width="12" height="8" rx="2"
            fill="#4CAF50" opacity="0.9" />

          {/* Bin body */}
          <g className="bin-body">
            {/* Main body */}
            <path d="M10 26 L12 64 Q12 68 16 68 L48 68 Q52 68 52 64 L54 26 Z"
              fill="#2E7D32" />
            {/* Shine */}
            <path d="M16 30 L17.5 62 Q17.5 65 20 65 L22 65 L20 30 Z"
              fill="rgba(255,255,255,0.15)" />
            {/* Vertical lines */}
            <line x1="28" y1="30" x2="27" y2="64" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <line x1="36" y1="30" x2="37" y2="64" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

            {/* Lid base / collar */}
            <rect x="8" y="22" width="48" height="6" rx="3" fill="#1B5E20" />

            {/* Handle on collar */}
            <rect x="26" y="18" width="12" height="6" rx="3" fill="#1B5E20" />

            {/* Lid (animated) */}
            <g className="bin-lid">
              <rect x="8" y="12" width="48" height="12" rx="4" fill="#388E3C" />
              {/* Lid shine */}
              <rect x="12" y="14" width="16" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
            </g>

            {/* Recycling symbol on body */}
            <text x="32" y="52" textAnchor="middle" fill="rgba(255,255,255,0.4)"
              fontSize="20" fontWeight="bold">♻</text>
          </g>
        </svg>
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
