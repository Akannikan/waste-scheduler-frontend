import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  MdRecycling, MdSchedule, MdMap, MdNotifications,
  MdBarChart, MdStar, MdArrowForward, MdPhone, MdEmail,
  MdMenu, MdClose,
} from 'react-icons/md';
import { FaLeaf, FaRecycle, FaWhatsapp } from 'react-icons/fa';

/* ─────────────────────────────────────────────────────────────
   All responsive styles are injected via <style> so no extra
   CSS file is needed and the component stays self-contained.
───────────────────────────────────────────────────────────── */
const STYLES = `
  /* Keyframes */
  @keyframes particleFloat {
    0%   { transform: translateY(0) rotate(0deg);   opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.4; }
    100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes heroFloat {
    0%,100% { transform: translateY(0);    }
    50%     { transform: translateY(-12px);}
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseCta {
    0%,100% { transform: scale(1);    }
    50%     { transform: scale(1.04); }
  }
  html { scroll-behavior: smooth; }

  /* ── Nav ── */
  .lp-nav-links { display: flex; gap: 4px; align-items: center; }
  .lp-menu-btn  { display: none; }
  .lp-mobile-menu {
    display: none;
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  }
  .lp-mobile-menu.open { display: flex; align-items: flex-start; justify-content: flex-end; }
  .lp-mobile-drawer {
    background: #fff; width: 78vw; max-width: 320px;
    height: 100vh; padding: 28px 24px;
    display: flex; flex-direction: column; gap: 6px;
    animation: slideInRight 0.25s ease;
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to   { transform: translateX(0);    }
  }

  /* ── Hero grid ── */
  .lp-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    width: 100%;
  }
  .lp-hero-mockup { display: flex; justify-content: center; animation: heroFloat 4s ease-in-out infinite; }

  /* ── Stats grid ── */
  .lp-stats-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 20px;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ── Feature grid ── */
  .lp-feature-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 24px;
  }

  /* ── Steps grid ── */
  .lp-steps-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 40px;
  }

  /* ── Roles grid ── */
  .lp-roles-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 24px;
  }

  /* ── Testimonials grid ── */
  .lp-testi-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 24px;
  }

  /* ── Footer grid ── */
  .lp-footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .lp-footer-bottom {
    border-top: 1px solid #1f2937;
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* ── Tablet (≤ 1024px) ── */
  @media (max-width: 1024px) {
    .lp-feature-grid  { grid-template-columns: repeat(2,1fr); }
    .lp-roles-grid    { grid-template-columns: repeat(2,1fr); }
    .lp-testi-grid    { grid-template-columns: repeat(2,1fr); }
    .lp-footer-grid   { grid-template-columns: 1fr 1fr; }
    .lp-stats-grid    { grid-template-columns: repeat(2,1fr); }
  }

  /* ── Mobile (≤ 768px) ── */
  @media (max-width: 768px) {
    /* Nav */
    .lp-nav-links { display: none; }
    .lp-menu-btn  { display: flex; }

    /* Hero: stack vertically */
    .lp-hero-grid   { grid-template-columns: 1fr; gap: 40px; }
    .lp-hero-mockup { animation: none; }

    /* Sections: single column */
    .lp-feature-grid  { grid-template-columns: 1fr; }
    .lp-steps-grid    { grid-template-columns: 1fr; gap: 32px; }
    .lp-roles-grid    { grid-template-columns: 1fr; }
    .lp-testi-grid    { grid-template-columns: 1fr; }
    .lp-stats-grid    { grid-template-columns: repeat(2,1fr); }
    .lp-footer-grid   { grid-template-columns: 1fr; gap: 28px; }
    .lp-footer-bottom { flex-direction: column; text-align: center; }

    /* Trust badges: wrap */
    .lp-trust { flex-wrap: wrap; gap: 16px !important; }

    /* CTA buttons: stack */
    .lp-cta-btns { flex-direction: column !important; align-items: stretch !important; }
    .lp-cta-btns a { text-align: center; justify-content: center !important; }
  }

  /* ── Small mobile (≤ 480px) ── */
  @media (max-width: 480px) {
    .lp-hero-tag { display: none; }
    .lp-stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

/* ── Animated counter ───────────────────────────────────────── */
function Counter({ target, suffix = '', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      let v = 0;
      const step = target / (2000 / 16);
      const t = setInterval(() => {
        v += step;
        if (v >= target) { setCount(target); clearInterval(t); }
        else setCount(Math.floor(v));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '20px 8px' }}>
      <div style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(12px,2vw,15px)', marginTop: 8 }}>{label}</div>
    </div>
  );
}

/* ── Floating particles ─────────────────────────────────────── */
const EMOJIS = ['♻️','🌿','🍃','💚','🌱','🗑️','🔋','📦','🌍','🌳'];
const POSITIONS = [5,14,23,32,41,50,59,68,77,86,11,29,47,65,83,20,38,56,74,92];

function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {POSITIONS.map((left, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${left}%`,
          bottom: '-40px',
          fontSize: `${14 + (i % 4) * 4}px`,
          opacity: 0.13 + (i % 3) * 0.04,
          animationName: 'particleFloat',
          animationDuration: `${11 + (i % 5) * 3}s`,
          animationDelay: `${(i % 9) * 1.1}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}>
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '28px 24px',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.13)' : '0 4px 24px rgba(0,0,0,0.07)',
        borderTop: `4px solid ${color}`,
        transform: hovered ? 'translateY(-6px)' : 'none',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        animation: `fadeInUp 0.6s ease ${delay}s both`,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 26, color }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#1a1a2e' }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Testimonial ────────────────────────────────────────────── */
function Testimonial({ name, role, city, text, avatar }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => <MdStar key={i} size={18} color="#FF9800" />)}
      </div>
      <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2E7D32,#1976D2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
          {avatar}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{role} · {city}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Mock dashboard card (hero right panel) ─────────────────── */
function MockDashboard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.96)',
      borderRadius: 24,
      padding: 'clamp(18px,3vw,28px)',
      width: '100%',
      maxWidth: 420,
      boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>
          <FaLeaf />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>WasteScheduler</div>
          <div style={{ fontSize: 11, color: '#888' }}>Good morning, Chidi 👋</div>
        </div>
        <div style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Active</div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,#2E7D32,#1B5E20)', borderRadius: 12, padding: '14px 16px', marginBottom: 14, color: '#fff' }}>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 3 }}>🗑️ Next Collection</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Organic Waste Pickup</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>Tomorrow 7:00 AM · Lagos Island · Brown Bin</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['📅','3','Pickups This Week'],['♻️','12kg','Waste Recycled'],['🏆','150','Eco Points'],['💳','₦2,000','Fee Paid']].map(([icon,val,label]) => (
          <div key={label} style={{ background: '#F8FFF8', borderRadius: 9, padding: '10px 12px', border: '1px solid #E8F5E9' }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{val}</div>
            <div style={{ fontSize: 9, color: '#888' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 5 }}>
        {[['#1976D2','Plastic'],['#66BB6A','Glass'],['#8D6E63','Organic'],['#7E57C2','E-Waste']].map(([color,name]) => (
          <div key={name} style={{ flex: 1, background: `${color}15`, borderRadius: 7, padding: '5px 3px', textAlign: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, margin: '0 auto 3px' }} />
            <div style={{ fontSize: 8, color: '#666', fontWeight: 600 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navLinkStyle = (dark) => ({
    color: dark ? '#374151' : 'rgba(255,255,255,0.88)',
    textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 12px',
    borderRadius: 6, transition: 'background 0.15s',
  });

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', overflowX: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ─── Sticky Navbar ─────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.09)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17 }}>
              <FaLeaf />
            </div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 17, color: scrolled ? '#1a1a2e' : '#fff' }}>
              WasteScheduler
            </span>
            <span style={{ fontSize: 10, background: '#2E7D32', color: '#fff', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>🇳🇬</span>
          </div>

          {/* Desktop nav links */}
          <div className="lp-nav-links">
            <a href="#features" style={navLinkStyle(scrolled)}>Features</a>
            <a href="#how-it-works" style={navLinkStyle(scrolled)}>How It Works</a>
            <a href="#testimonials" style={navLinkStyle(scrolled)}>Reviews</a>
            <Link to="/login" style={{ ...navLinkStyle(scrolled), color: scrolled ? '#2E7D32' : '#fff', border: `2px solid ${scrolled ? '#2E7D32' : 'rgba(255,255,255,0.65)'}`, padding: '7px 16px', fontWeight: 600 }}>
              Login
            </Link>
            <Link to="/register" style={{ background: '#2E7D32', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 8 }}>
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lp-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#1a1a2e' : '#fff', padding: 6 }}
            aria-label="Open menu"
          >
            <MdMenu size={28} />
          </button>
        </div>
      </nav>

      {/* ─── Mobile Menu ───────────────────────────────── */}
      <div className={`lp-mobile-menu ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="lp-mobile-drawer" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}><FaLeaf /></div>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>WasteScheduler</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
              <MdClose size={24} />
            </button>
          </div>

          {[['#features','Features'],['#how-it-works','How It Works'],['#testimonials','Reviews']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', padding: '12px 8px', color: '#374151', textDecoration: 'none', fontSize: 15, fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>
              {label}
            </a>
          ))}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', textAlign: 'center', padding: '13px', border: '2px solid #2E7D32', borderRadius: 10, color: '#2E7D32', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
              Login
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', textAlign: 'center', padding: '13px', background: '#2E7D32', borderRadius: 10, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Hero ──────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 42%,#1565C0 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(80px,12vw,110px) 5% clamp(60px,8vw,80px)',
        overflow: 'hidden',
      }}>
        <Particles />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '18%', right: '8%', width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.07)', zIndex: 0 }} />

        <div className="lp-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Left copy */}
          <div>
            <div className="lp-hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 14 }}>🇳🇬</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>Nigeria's #1 Waste Management Platform</span>
            </div>

            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(30px,5.5vw,58px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
              Cleaner Nigeria<br />
              <span style={{ color: '#A5D6A7' }}>Starts With You</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(14px,2vw,18px)', lineHeight: 1.7, marginBottom: 32, maxWidth: 500 }}>
              Track waste schedules, find recycling centers, pay fees, report issues — all in one platform built for Nigerian communities from Lagos to Kano.
            </p>

            <div className="lp-cta-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: '#fff', color: '#2E7D32', textDecoration: 'none',
                padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 'clamp(14px,1.6vw,16px)',
                display: 'inline-flex', alignItems: 'center', gap: 9,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                animation: 'pulseCta 3s ease infinite',
              }}>
                Get Started Free <MdArrowForward size={18} />
              </Link>
              <a href="#how-it-works" style={{
                background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none',
                padding: '14px 24px', borderRadius: 12, fontWeight: 600, fontSize: 'clamp(14px,1.6vw,16px)',
                border: '2px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)',
                display: 'inline-block',
              }}>
                How It Works ▾
              </a>
            </div>

            {/* Trust indicators */}
            <div className="lp-trust" style={{ marginTop: 40, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[['🏙️','Lagos','Zone A-Z'],['🌆','Abuja','FCT Zones'],['🏘️','Port Harcourt','Rivers State']].map(([e,c,z]) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 19 }}>{e}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{c}</div>
                    <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 11 }}>{z}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — mock dashboard (hidden on very small screens) */}
          <div className="lp-hero-mockup">
            <MockDashboard />
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ──────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg,#1B5E20,#2E7D32,#1565C0)', padding: 'clamp(28px,5vw,44px) 5%' }}>
        <div className="lp-stats-grid">
          <Counter target={50000} suffix="+" label="Registered Residents" />
          <Counter target={12}    suffix="+" label="Nigerian Cities" />
          <Counter target={98}    suffix="%" label="Collection Rate" />
          <Counter target={500}   suffix="T" label="Waste Diverted Monthly" />
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────── */}
      <section id="features" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#F8FFF8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Features</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, margin: '14px 0', color: '#1a1a2e' }}>
              Everything Your Community Needs
            </h2>
            <p style={{ color: '#6b7280', fontSize: 'clamp(14px,1.8vw,16px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Built specifically for Nigerian waste management — from sachet water bags to generator batteries.
            </p>
          </div>
          <div className="lp-feature-grid">
            <FeatureCard delay={0}   color="#2E7D32" icon={<MdSchedule size={26} />}   title="Smart Collection Schedules" desc="View your personalized pickup dates by zone, category, and time. Get email and in-app reminders before every collection." />
            <FeatureCard delay={0.1} color="#1976D2" icon={<MdMap size={26} />}        title="Nigeria Recycling Map"      desc="Find the nearest recycling center in Lagos, Abuja, PH and 12 other cities. Filter by waste type and distance." />
            <FeatureCard delay={0.2} color="#FF9800" icon={<MdNotifications size={26}/>} title="Smart Reminders"           desc="Automated email notifications 24h and 2h before your pickup. Never miss a collection day again." />
            <FeatureCard delay={0.3} color="#7E57C2" icon={<FaRecycle size={24} />}    title="AI Waste Assistant"         desc="Ask WasteBot anything — from where to dump your old Tecno phone to how to dispose of used engine oil." />
            <FeatureCard delay={0.4} color="#D32F2F" icon={<MdBarChart size={26} />}   title="Eco Analytics"              desc="Track your waste generation, see monthly summaries, and measure your community environmental impact." />
            <FeatureCard delay={0.5} color="#00796B" icon={<MdStar size={26} />}       title="Eco Quiz & Gamification"    desc="Play recycling quizzes, earn eco-points, win badges, and climb the community leaderboard. Works offline!" />
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────── */}
      <section id="how-it-works" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ background: '#E3F2FD', color: '#1976D2', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>How It Works</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, margin: '14px 0', color: '#1a1a2e' }}>
              Three Simple Steps
            </h2>
          </div>
          <div className="lp-steps-grid">
            {[
              { step: '01', icon: '📱', title: 'Create Your Account',  desc: 'Sign up free with your email or Google account. Select your Nigerian state and LGA to get personalised schedules.' },
              { step: '02', icon: '🗓️', title: 'Check Your Schedule',  desc: 'View upcoming pickup dates on your dashboard or calendar. Enable notifications for automatic reminders.' },
              { step: '03', icon: '♻️', title: 'Track & Contribute',   desc: 'Log your waste, pay fees, report issues, and earn eco-points. Help build a cleaner Nigeria together.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', animation: `fadeInUp 0.6s ease ${i * 0.15}s both` }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 22 }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#E8F5E9,#E3F2FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto', boxShadow: '0 4px 20px rgba(46,125,50,0.14)' }}>
                    {item.icon}
                  </div>
                  <div style={{ position: 'absolute', top: -5, right: -5, width: 26, height: 26, borderRadius: '50%', background: '#2E7D32', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.step}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,80px) 5%', background: 'linear-gradient(135deg,#F1F8E9,#E3F2FD)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#1a1a2e' }}>Built for Everyone</h2>
          </div>
          <div className="lp-roles-grid">
            {[
              { role: 'Residents',      icon: '🏠', color: '#2E7D32', desc: 'Track pickups, log waste, pay fees, submit reports, earn eco-points and quiz badges.', features: ['Pickup Calendar','Waste Log','Billing & Payments','Eco Quiz','AI Assistant'] },
              { role: 'Collectors',     icon: '🚛', color: '#1976D2', desc: 'View assigned routes, mark collections complete, communicate with admin in real-time.',  features: ['Assigned Pickups','Assignment Inbox','Collection History','Admin Messaging','Route Details'] },
              { role: 'Administrators', icon: '⚙️', color: '#FF9800', desc: 'Manage users, zones, schedules, billing, assignments, and performance analytics.',       features: ['User Management','Assign Duties','Analytics','Billing','Announcements'] },
            ].map((item) => (
              <div key={item.role} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', borderTop: `4px solid ${item.color}` }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 19, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{item.role}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 18 }}>{item.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {item.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                      <span style={{ color: item.color, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────── */}
      <section id="testimonials" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ background: '#FFF9C4', color: '#F57F17', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Testimonials</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, margin: '14px 0', color: '#1a1a2e' }}>
              What Nigerians Are Saying
            </h2>
          </div>
          <div className="lp-testi-grid">
            <Testimonial name="Adaeze Okonkwo" role="Resident"     city="Lagos Island" avatar="A" text="I never miss my pickup days anymore! The reminders come right to my email the night before. My street is cleaner than it's ever been." />
            <Testimonial name="Emeka Chukwu"   role="PSP Collector" city="Ikeja, Lagos"  avatar="E" text="The assignment feature makes it easy for me to know exactly which routes to cover each day. The admin can message me directly — no more phone tag!" />
            <Testimonial name="Fatima Bello"   role="Admin Officer" city="Abuja, FCT"    avatar="F" text="The analytics dashboard shows me exactly which zones are underperforming. Billing is automated and residents pay without stress. Brilliant system!" />
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32,#1565C0)', padding: 'clamp(60px,8vw,100px) 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(44px,8vw,60px)', marginBottom: 14, animation: 'rotateSlow 8s linear infinite', display: 'inline-block' }}>♻️</div>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,4.5vw,46px)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            Join the Green Revolution
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.83)', fontSize: 'clamp(14px,2vw,18px)', lineHeight: 1.7, marginBottom: 36 }}>
            Register today for free and be part of building a cleaner, healthier Nigeria for future generations. 🇳🇬
          </p>
          <div className="lp-cta-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#fff', color: '#2E7D32', textDecoration: 'none', padding: 'clamp(13px,2vw,18px) clamp(24px,3vw,40px)', borderRadius: 14, fontWeight: 700, fontSize: 'clamp(14px,1.8vw,17px)', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              Create Free Account <MdArrowForward size={20} />
            </Link>
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', padding: 'clamp(13px,2vw,18px) clamp(20px,2.5vw,32px)', borderRadius: 14, fontWeight: 600, fontSize: 'clamp(14px,1.8vw,17px)', border: '2px solid rgba(255,255,255,0.32)', display: 'inline-block' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer style={{ background: '#0D1117', padding: 'clamp(36px,5vw,60px) 5% clamp(20px,3vw,30px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lp-footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}><FaLeaf /></div>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 17, color: '#fff' }}>WasteScheduler</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.7 }}>
                Nigeria's smart waste management platform. Building cleaner communities across Lagos, Abuja, Port Harcourt and beyond.
              </p>
              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                {[MdPhone, MdEmail, FaWhatsapp].map((Icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer' }}>
                    <Icon size={15} />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: 'Platform', links: ['Dashboard','Schedule','Recycling Map','Waste Guide','Billing'] },
              { title: 'Company',  links: ['About Us','Contact','Privacy Policy','Terms of Use'] },
              { title: 'Support',  links: ['Help Center','Report Issue','LAWMA','PSP Operators'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 14, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.links.map(l => (
                    <li key={l} style={{ color: '#6b7280', fontSize: 13, padding: '5px 0', cursor: 'pointer', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color='#9ca3af'}
                      onMouseLeave={e => e.target.style.color='#6b7280'}>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lp-footer-bottom">
            <span style={{ color: '#4b5563', fontSize: 12 }}>© {new Date().getFullYear()} WasteScheduler Nigeria. All rights reserved.</span>
            <div style={{ height: 4, width: 56, borderRadius: 2, background: 'linear-gradient(90deg,#008751 33%,#fff 33%,#fff 66%,#008751 66%)', flexShrink: 0 }} />
            <span style={{ color: '#4b5563', fontSize: 12 }}>Made with 💚 for a cleaner Nigeria 🇳🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
