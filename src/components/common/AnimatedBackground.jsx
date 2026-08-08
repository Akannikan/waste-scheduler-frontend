import { useEffect, useRef } from 'react';

const PARTICLES = [
  { emoji: '♻️', size: 22 },
  { emoji: '🗑️', size: 18 },
  { emoji: '🌿', size: 16 },
  { emoji: '🍃', size: 14 },
  { emoji: '💚', size: 12 },
  { emoji: '🌱', size: 16 },
  { emoji: '🔋', size: 14 },
  { emoji: '📦', size: 18 },
];

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => {
        const p = PARTICLES[i % PARTICLES.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 12 + Math.random() * 18;
        const opacity = 0.06 + Math.random() * 0.08;
        return (
          <span
            key={i}
            className="bg-particle"
            style={{
              left: `${left}%`,
              fontSize: `${p.size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity,
            }}
          >
            {p.emoji}
          </span>
        );
      })}
    </div>
  );
}
