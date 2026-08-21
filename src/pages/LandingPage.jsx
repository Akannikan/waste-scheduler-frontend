import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { MdArrowForward, MdArrowBack, MdArrowForwardIos, MdArrowBackIos, MdMenu, MdClose, MdCheckCircle } from 'react-icons/md';
import { FaLeaf, FaRecycle, FaWhatsapp } from 'react-icons/fa';
import { getSiteReviews } from '../api';

/* ─── Carousel slides focused on residential waste collection trucks ─── */
const SLIDES = [
  {
    bg: 'linear-gradient(135deg,#0f5b3d 0%,#1e8a5f 45%,#2b7a4b 100%)',
    tag: 'Estate pickup service',
    title: 'Professional waste collection coming directly to your estate',
    sub: 'Reliable weekly collection for homes, apartment blocks, and residential communities across Nigerian neighborhoods.',
    primaryCta: { label: 'Schedule Waste Collection', to: '/register' },
    secondaryCta: { label: 'Track Collection', to: '/login' },
    accent: '#d8f8df',
    stat: { value: 'Same week', label: 'estate bookings' },
    visual: (
      <img
        src="https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=900&q=80"
        alt="Waste collection truck in a residential estate"
        style={{ width: '100%', height: 330, borderRadius: 18, objectFit: 'cover', display: 'block', boxShadow: '0 24px 50px rgba(0,0,0,0.15)' }}
      />
    ),
  },
  {
    bg: 'linear-gradient(135deg,#0c5a63 0%,#1d7d8a 48%,#2f5f9b 100%)',
    tag: 'Clean community streets',
    title: 'Waste trucks working in your neighborhood',
    sub: 'From gated estates to inner-city streets, our collection teams keep residential roads neat and compliant.',
    primaryCta: { label: 'Schedule Waste Collection', to: '/register' },
    secondaryCta: { label: 'Track Collection', to: '/login' },
    accent: '#cfe8ff',
    stat: { value: '24/7', label: 'route visibility' },
    visual: (
      <img
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
        alt="Blue waste collection truck on a street"
        style={{ width: '100%', height: 330, borderRadius: 18, objectFit: 'cover', display: 'block', boxShadow: '0 24px 50px rgba(0,0,0,0.15)' }}
      />
    ),
  },
  {
    bg: 'linear-gradient(135deg,#22532c 0%,#2e7d32 45%,#3f8f32 100%)',
    tag: 'Reliable residential service',
    title: 'Green trucks collecting waste with care',
    sub: 'Professional crews and organized pickup windows make managing estate waste simple for residents and managers.',
    primaryCta: { label: 'Schedule Waste Collection', to: '/register' },
    secondaryCta: { label: 'Track Collection', to: '/login' },
    accent: '#d8f8df',
    stat: { value: '98%', label: 'pickup success rate' },
    visual: (
      <img
        src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80"
        alt="Green waste collection truck moving through a neighborhood"
        style={{ width: '100%', height: 330, borderRadius: 18, objectFit: 'cover', display: 'block', boxShadow: '0 24px 50px rgba(0,0,0,0.15)' }}
      />
    ),
  },
];

/* ─── How it works steps ─── */
const STEPS = [
  { icon: '📱', n: '01', title: 'Create Account', desc: 'Sign up free with email or Google. Select your Nigerian state, LGA and collection zone.' },
  { icon: '🗓️', n: '02', title: 'View Your Schedule', desc: 'See your personalised pickup calendar. Enable email reminders so you never miss a collection.' },
  { icon: '♻️', n: '03', title: 'Track & Contribute', desc: 'Log waste, pay fees, submit reports, play eco quizzes and earn points for your community.' },
];

/* ─── Navbar ──────────────────────────────────────────────────── */
function Navbar({ scrolled, mobileOpen, setMobileOpen }) {
  const linkColor = scrolled ? '#374151' : 'rgba(255,255,255,0.88)';
  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.09)' : 'none',
        transition: 'all .3s ease', padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17 }}>
              <FaLeaf />
            </div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 17, color: scrolled ? '#1a1a2e' : '#fff' }}>WasteScheduler</span>
            <span style={{ fontSize: 10, background: '#2E7D32', color: '#fff', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>🇳🇬</span>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="lp-nav-links">
            {['#features','#how-it-works','#testimonials'].map((h, i) => (
              <a key={h} href={h} style={{ color: linkColor, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 12px', borderRadius: 6 }}>
                {['Features','How It Works','Reviews'][i]}
              </a>
            ))}
            <Link to="/login" style={{ color: scrolled ? '#2E7D32' : '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '8px 18px', border: `2px solid ${scrolled ? '#2E7D32' : 'rgba(255,255,255,0.6)'}`, borderRadius: 8 }}>
              Login
            </Link>
            <Link to="/register" style={{ background: '#2E7D32', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 8 }}>
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(true)} className="lp-menu-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#1a1a2e' : '#fff', padding: 6 }}>
            <MdMenu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          onClick={() => setMobileOpen(false)}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '78vw', maxWidth: 320, background: '#fff', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FaLeaf size={15} /></div>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 15 }}>WasteScheduler</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MdClose size={24} /></button>
            </div>
            {[['#features','Features'],['#how-it-works','How It Works'],['#testimonials','Reviews']].map(([h, l]) => (
              <a key={h} href={h} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 8px', color: '#374151', textDecoration: 'none', fontSize: 15, fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>
                {l}
              </a>
            ))}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: 13, border: '2px solid #2E7D32', borderRadius: 10, color: '#2E7D32', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: 13, background: '#2E7D32', borderRadius: 10, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero Carousel ──────────────────────────────────────────── */
function HeroCarousel() {
  const [idx, setIdx]     = useState(0);
  const [anim, setAnim]   = useState('');   // 'in' | ''
  const autoRef           = useRef(null);
  const total             = SLIDES.length;

  const goTo = (next, dir) => {
    clearInterval(autoRef.current);
    setAnim(dir);
    setTimeout(() => { setIdx(next); setAnim(''); }, 220);
    startAuto();
  };

  const prev = () => goTo((idx - 1 + total) % total, 'prev');
  const next = () => goTo((idx + 1) % total, 'next');

  const startAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setIdx(i => { setAnim('next'); setTimeout(() => setAnim(''), 220); return (i + 1) % total; });
    }, 5500);
  };

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, []);

  const s = SLIDES[idx];

  return (
    <section style={{ background: s.bg, minHeight: '92vh', position: 'relative', display: 'flex', alignItems: 'center', padding: 'clamp(90px,12vw,110px) 5% clamp(60px,8vw,80px)', overflow: 'hidden', transition: 'background .6s ease' }}>
      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:none; } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px);} to { opacity:1; transform:none; } }
        @keyframes pulseCta { 0%,100%{transform:scale(1);} 50%{transform:scale(1.04);} }
        .lp-nav-links { display:flex; gap:6px; align-items:center; }
        .lp-menu-btn  { display:none; }
        @media(max-width:768px){ .lp-nav-links{display:none;} .lp-menu-btn{display:flex;} }
      `}</style>

      {/* Decorative circles */}
      <div style={{ position:'absolute', top:'5%', right:'3%', width:420, height:420, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.06)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,5vw,60px)', alignItems: 'center', position: 'relative', zIndex: 1 }}
        className="lp-hero-grid">

        {/* Left text — re-animates on slide change */}
        <div key={`text-${idx}`} style={{ animation: `${anim === 'next' ? 'slideInRight' : anim === 'prev' ? 'slideInLeft' : 'slideInRight'} .35s ease` }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.14)', borderRadius:30, padding:'6px 16px', marginBottom:20, backdropFilter:'blur(8px)' }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.9)', fontWeight:500 }}>{s.tag}</span>
          </div>
          <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(30px,5vw,54px)', fontWeight:800, color:'#fff', lineHeight:1.18, marginBottom:18, whiteSpace:'pre-line' }}>
            {s.title}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'clamp(14px,1.8vw,17px)', lineHeight:1.75, marginBottom:32, maxWidth:480 }}>
            {s.sub}
          </p>

          {/* Stat pill */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 18px', marginBottom:28, backdropFilter:'blur(8px)' }}>
            <span style={{ fontSize:24, fontWeight:800, color:s.accent }}>{s.stat.value}</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.75)' }}>{s.stat.label}</span>
          </div>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to={s.primaryCta.to} style={{ background:'#fff', color:'#0F7C5D', textDecoration:'none', padding:'13px 28px', borderRadius:10, fontWeight:700, fontSize:'clamp(13px,1.5vw,15px)', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(0,0,0,0.18)', animation:'pulseCta 3s ease infinite' }}>
              {s.primaryCta.label} <MdArrowForward size={17} />
            </Link>
            <Link to={s.secondaryCta.to} style={{ background:'rgba(255,255,255,0.08)', color:'#fff', textDecoration:'none', padding:'13px 22px', borderRadius:10, fontWeight:600, fontSize:'clamp(13px,1.5vw,15px)', border:'1px solid rgba(255,255,255,0.24)', backdropFilter:'blur(8px)' }}>
              {s.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Right visual card */}
        <div key={`visual-${idx}`} style={{ animation:`${anim === 'next' ? 'slideInRight' : 'slideInLeft'} .35s ease .08s both`, display:'flex', justifyContent:'center' }}>
          <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:24, padding:'clamp(20px,3vw,32px)', width:'100%', maxWidth:400, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            {s.visual}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={prev} style={{ position:'absolute', left:'clamp(10px,2vw,24px)', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', backdropFilter:'blur(8px)', zIndex:5 }}>
        <MdArrowBackIos size={18} />
      </button>
      <button onClick={next} style={{ position:'absolute', right:'clamp(10px,2vw,24px)', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', backdropFilter:'blur(8px)', zIndex:5 }}>
        <MdArrowForwardIos size={18} />
      </button>

      {/* Dot indicators */}
      <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:5 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i, i > idx ? 'next' : 'prev')}
            style={{ width: i === idx ? 24 : 8, height:8, borderRadius:4, background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)', border:'none', cursor:'pointer', transition:'all .3s ease', padding:0 }} />
        ))}
      </div>
    </section>
  );
}

/* ─── Stats bar ───────────────────────────────────────────────── */
function StatItem({ value, label, icon }) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);
  const num     = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      let v = 0; const step = num / (1800 / 16);
      const t = setInterval(() => {
        v += step;
        if (v >= num) { setCount(num); clearInterval(t); }
        else setCount(Math.floor(v));
      }, 16);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [num]);

  const display = value.includes('+') ? `${count.toLocaleString()}+`
    : value.includes('%') ? `${count}%`
    : value.includes('T') ? `${count}T`
    : value.includes('₦') ? `₦${count.toLocaleString()}`
    : count.toLocaleString();

  return (
    <div ref={ref} style={{ textAlign:'center', padding:'20px 8px' }}>
      <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:'clamp(28px,4vw,40px)', fontWeight:800, color:'#fff', lineHeight:1 }}>{display}</div>
      <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'clamp(12px,1.5vw,14px)', marginTop:6 }}>{label}</div>
    </div>
  );
}

/* ─── Feature card ────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:'#fff', borderRadius:14, padding:'24px 22px', boxShadow: hov ? '0 10px 28px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)', borderTop:`3px solid ${color}`, transform: hov ? 'translateY(-4px)' : 'none', transition:'all .2s ease' }}>
      <div style={{ width:48, height:48, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color, marginBottom:14 }}>{icon}</div>
      <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:16, fontWeight:700, marginBottom:8, color:'#1a1a2e' }}>{title}</h3>
      <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7, margin:0 }}>{desc}</p>
    </div>
  );
}

/* ─── Testimonial carousel ────────────────────────────────────── */
function TestimonialCarousel() {
  const [reviews, setReviews] = useState([]);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState('');
  const [loading, setLoading] = useState(true);
  const autoRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getSiteReviews()
      .then(({ data }) => {
        if (!mounted) return;
        setReviews(data.reviews || []);
      })
      .catch(() => setReviews([]))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const goTo = (next, dir) => {
    if (!reviews.length) return;
    clearInterval(autoRef.current);
    setAnim(dir);
    setTimeout(() => { setIdx(next); setAnim(''); startAuto(); }, 220);
  };

  const startAuto = () => {
    if (!reviews.length) return;
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() =>
      setIdx(i => { setAnim('next'); setTimeout(() => setAnim(''), 220); return (i + 1) % reviews.length; }), 4500);
  };

  useEffect(() => { if (reviews.length) startAuto(); return () => clearInterval(autoRef.current); }, [reviews.length]);

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Loading stories...</div>;
  }

  if (!reviews.length) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '42px 24px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.82)', margin: 0 }}>No community stories yet. Be the first to share your waste-impact journey.</p>
        </div>
      </div>
    );
  }

  const t = reviews[idx % reviews.length];
  const initial = t.user?.name?.charAt(0)?.toUpperCase() || 'C';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div key={idx} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.24)', borderRadius: 24, padding: 'clamp(24px,4vw,40px)', boxShadow: '0 18px 50px rgba(5,70,48,0.18)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', minHeight: 220, animation: `${anim === 'next' ? 'slideInRight' : anim === 'prev' ? 'slideInLeft' : 'none'} .3s ease` }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < t.rating ? '#FF9800' : '#d1d5db', fontSize: 20 }}>★</span>)}
        </div>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
          “{t.comment}”
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#2E7D32,#66BB6A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
            {t.user?.avatarUrl ? <img src={t.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{t.user?.name || 'Community Member'}</div>
            <div style={{ fontSize: 13, color: '#A5D6A7', fontWeight: 600 }}>{[t.user?.state, t.user?.lga, t.user?.zone].filter(Boolean).join(' · ') || 'Nigeria'} </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
        <button onClick={() => goTo((idx - 1 + reviews.length) % reviews.length, 'prev')} aria-label="Previous testimonial" style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <MdArrowBackIos size={16} />
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {reviews.map((_, i) => (
            <button key={i} onClick={() => goTo(i, i > idx ? 'next' : 'prev')} aria-label={`Show testimonial ${i + 1}`} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? '#A5D6A7' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
          ))}
        </div>
        <button onClick={() => goTo((idx + 1) % reviews.length, 'next')} aria-label="Next testimonial" style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <MdArrowForwardIos size={16} />
        </button>
      </div>

    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily:'Inter,sans-serif', overflowX:'hidden', background:'#fff' }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:none;} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:none;} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;} }
        .lp-hero-grid { grid-template-columns: 1fr 1fr; gap: clamp(28px,5vw,60px); }
        @media(max-width:820px) {
          .lp-hero-grid { grid-template-columns:1fr !important; }
          .lp-hero-visual { display:none !important; }
        }
        .lp-feature-grid { grid-template-columns: repeat(3,1fr); }
        @media(max-width:900px)  { .lp-feature-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media(max-width:540px)  { .lp-feature-grid { grid-template-columns:1fr !important; } }
        .lp-steps-grid { grid-template-columns: repeat(3,1fr); }
        @media(max-width:700px)  { .lp-steps-grid { grid-template-columns:1fr !important; } }
        .lp-roles-grid { grid-template-columns: repeat(3,1fr); }
        @media(max-width:900px)  { .lp-roles-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media(max-width:540px)  { .lp-roles-grid { grid-template-columns:1fr !important; } }
        .lp-stats-grid { grid-template-columns:repeat(4,1fr); }
        @media(max-width:700px)  { .lp-stats-grid { grid-template-columns:repeat(2,1fr) !important; } }
        .lp-footer-grid { grid-template-columns:2fr 1fr 1fr 1fr; }
        @media(max-width:900px)  { .lp-footer-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:540px)  { .lp-footer-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ── 1. Hero carousel ── */}
      <HeroCarousel />

      {/* ── 2. Stats bar ── */}
      <section style={{ background:'linear-gradient(90deg,#1B5E20,#2E7D32,#1565C0)', padding:'clamp(24px,4vw,40px) 5%' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gap:16 }} className="lp-stats-grid">
          <StatItem value="50000+"  label="Registered Residents"    icon="👥" />
          <StatItem value="12+"     label="Nigerian Cities Covered"  icon="🏙️" />
          <StatItem value="98%"     label="Collection Rate"          icon="✅" />
          <StatItem value="500T"    label="Waste Diverted Monthly"   icon="♻️" />
        </div>
      </section>

      {/* ── 3. Features ── */}
      <section id="features" style={{ padding:'clamp(52px,8vw,88px) 5%', background:'#F8FFF8' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span style={{ background:'#E8F5E9', color:'#2E7D32', padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:.8 }}>Features</span>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:800, margin:'12px 0 10px', color:'#1a1a2e' }}>Everything Your Community Needs</h2>
            <p style={{ color:'#6b7280', fontSize:'clamp(13px,1.6vw,15px)', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>
              Built specifically for Nigerian waste challenges — from sachet water bags to generator batteries.
            </p>
          </div>
          <div style={{ display:'grid', gap:20 }} className="lp-feature-grid">
            <FeatureCard color="#2E7D32" icon="📅" title="Smart Pickup Schedule"   desc="Personalised pickup calendar by zone and category. Email reminders 24h before each collection." />
            <FeatureCard color="#1976D2" icon="🗺️" title="Nigeria Recycling Map"   desc="15+ recycling centers across Lagos, Abuja, PH, Ilorin and more. Filter by waste type." />
            <FeatureCard color="#FF9800" icon="🔔" title="Automated Reminders"     desc="Email and in-app alerts before every pickup. Never miss a collection day again." />
            <FeatureCard color="#7E57C2" icon="🤖" title="AI Waste Assistant"      desc="Ask WasteBot anything — disposal methods, nearest centers, schedule info. Available 24/7." />
            <FeatureCard color="#D32F2F" icon="📣" title="Report Issues"           desc="Report missed pickups or illegal dumping with photos and GPS. Resolved within 48 hours." />
            <FeatureCard color="#00796B" icon="🎮" title="Eco Quiz & Rewards"      desc="Play quizzes, earn eco-points, win badges and climb the community leaderboard." />
          </div>
        </div>
      </section>

      {/* ── 4. How It Works ── */}
      <section id="how-it-works" style={{ padding:'clamp(52px,8vw,88px) 5%', background:'#fff' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span style={{ background:'#E3F2FD', color:'#1976D2', padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:.8 }}>How It Works</span>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:800, margin:'12px 0', color:'#1a1a2e' }}>Three Simple Steps</h2>
          </div>
          <div style={{ display:'grid', gap:36 }} className="lp-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign:'center', animation:`fadeUp .6s ease ${i*.15}s both` }}>
                <div style={{ position:'relative', display:'inline-block', marginBottom:18 }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#E8F5E9,#E3F2FD)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto', boxShadow:'0 4px 16px rgba(46,125,50,0.14)' }}>
                    {s.icon}
                  </div>
                  <div style={{ position:'absolute', top:-4, right:-4, width:24, height:24, borderRadius:'50%', background:'#2E7D32', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {s.n}
                  </div>
                </div>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Roles ── */}
      <section style={{ padding:'clamp(48px,7vw,80px) 5%', background:'#F8FFF8' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(22px,3.5vw,34px)', fontWeight:800, color:'#1a1a2e' }}>Built for Every Role</h2>
          </div>
          <div style={{ display:'grid', gap:20 }} className="lp-roles-grid">
            {[
              { role:'Residents', icon:'🏠', color:'#2E7D32', features:['Pickup Calendar','Waste Log','Billing (₦)','Eco Quiz','AI Assistant','Reports'] },
              { role:'Collectors', icon:'🚛', color:'#1976D2', features:['Assigned Pickups','Assignment Inbox','Collection History','Admin Chat','Route Details'] },
              { role:'Administrators', icon:'⚙️', color:'#FF9800', features:['User Management','Assign Duties','Analytics','Billing','Announcements'] },
            ].map(item => (
              <div key={item.role} style={{ background:'#fff', borderRadius:16, padding:'24px 22px', boxShadow:'0 2px 14px rgba(0,0,0,0.06)', borderTop:`3px solid ${item.color}` }}>
                <div style={{ fontSize:34, marginBottom:10 }}>{item.icon}</div>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#1a1a2e', marginBottom:16 }}>{item.role}</h3>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {item.features.map(f => (
                    <li key={f} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #f3f4f6', fontSize:13, color:'#374151' }}>
                      <MdCheckCircle size={15} color={item.color} style={{ flexShrink:0 }} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials carousel ── */}
      <section id="testimonials" style={{ padding:'clamp(56px,8vw,96px) 5%', background:'linear-gradient(135deg,#0d4b36 0%,#176b4d 48%,#123f55 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <span style={{ color:'#A5D6A7', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:1.4 }}>Testimonials</span>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:800, margin:'12px 0', color:'#fff' }}>What Nigerians Are Saying</h2>
            <p style={{ color:'rgba(255,255,255,0.7)', margin:'0 auto', maxWidth:520, fontSize:15 }}>Real voices from people making everyday waste management simpler.</p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section style={{ background:'linear-gradient(135deg,#1B5E20,#2E7D32)', padding:'clamp(52px,8vw,80px) 5%', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:640, margin:'0 auto' }}>
          <div style={{ fontSize:'clamp(40px,6vw,56px)', marginBottom:12 }}>🌍</div>
          <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'clamp(22px,4vw,42px)', fontWeight:800, color:'#fff', marginBottom:12 }}>Join the Green Revolution</h2>
          <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'clamp(14px,1.8vw,17px)', lineHeight:1.7, marginBottom:32 }}>
            Register free today and help build a cleaner, healthier Nigeria for future generations 🇳🇬
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ background:'#fff', color:'#2E7D32', textDecoration:'none', padding:'14px 32px', borderRadius:12, fontWeight:700, fontSize:'clamp(14px,1.6vw,16px)', display:'inline-flex', alignItems:'center', gap:9, boxShadow:'0 6px 20px rgba(0,0,0,0.18)' }}>
              Create Free Account <MdArrowForward size={18} />
            </Link>
            <Link to="/login" style={{ background:'rgba(255,255,255,0.12)', color:'#fff', textDecoration:'none', padding:'14px 24px', borderRadius:12, fontWeight:600, fontSize:'clamp(14px,1.6vw,16px)', border:'2px solid rgba(255,255,255,0.3)', display:'inline-block' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer style={{ background:'#0D1117', padding:'clamp(32px,5vw,52px) 5% 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gap:32, marginBottom:32 }} className="lp-footer-grid">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#2E7D32', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><FaLeaf size={15} /></div>
                <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:16, color:'#fff' }}>WasteScheduler</span>
              </div>
              <p style={{ color:'#6b7280', fontSize:13, lineHeight:1.7 }}>Nigeria's smart waste management platform — Lagos, Abuja, Port Harcourt, Ilorin and beyond.</p>
            </div>
            {[
              { title:'Platform', links:['Schedule','Recycling Map','Waste Guide','Billing','Eco Quiz'] },
              { title:'Company',  links:['About Us','Privacy Policy','Terms of Use','Contact'] },
              { title:'Support',  links:['Help Center','Report Issue','LAWMA Info','PSP Operators'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color:'#e5e7eb', fontWeight:700, marginBottom:12, fontSize:13, textTransform:'uppercase', letterSpacing:.6 }}>{col.title}</h4>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {col.links.map(l => <li key={l} style={{ color:'#6b7280', fontSize:13, padding:'4px 0', cursor:'pointer' }}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #1f2937', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <span style={{ color:'#4b5563', fontSize:12 }}>© {new Date().getFullYear()} WasteScheduler Nigeria</span>
            <div style={{ height:4, width:52, borderRadius:2, background:'linear-gradient(90deg,#008751 33%,#fff 33%,#fff 66%,#008751 66%)' }} />
            <span style={{ color:'#4b5563', fontSize:12 }}>Made with 💚 for Nigeria 🇳🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
