import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MdRecycling, MdSchedule, MdMap, MdNotifications, MdBarChart, MdStar, MdArrowForward, MdPhone, MdEmail } from 'react-icons/md';
import { FaLeaf, FaRecycle, FaTree, FaWhatsapp } from 'react-icons/fa';

// ── Animated counter ──────────────────────────────────────────
function Counter({ target, suffix = '', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '20px 10px' }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 8 }}>{label}</div>
    </div>
  );
}

// ── Floating particles ────────────────────────────────────────
const PARTICLES = ['♻️','🌿','🍃','💚','🌱','🗑️','🔋','📦','🌍','🌳'];

function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          bottom: '-40px',
          fontSize: `${14 + Math.random() * 16}px`,
          opacity: 0.12 + Math.random() * 0.1,
          animationName: 'particleFloat',
          animationDuration: `${10 + Math.random() * 15}s`,
          animationDelay: `${Math.random() * 10}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}>
          {PARTICLES[i % PARTICLES.length]}
        </span>
      ))}
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '28px 24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      borderTop: `4px solid ${color}`,
      animation: `fadeInUp 0.6s ease ${delay}s both`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.14)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 26, color }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#1a1a2e' }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── Testimonial ───────────────────────────────────────────────
function Testimonial({ name, role, city, text, avatar }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => <MdStar key={i} size={18} color="#FF9800" />)}
      </div>
      <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2E7D32,#1976D2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Sticky Nav ────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
              <FaLeaf />
            </div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: scrolled ? '#1a1a2e' : '#fff' }}>
              WasteScheduler
            </span>
            <span style={{ fontSize: 11, background: '#2E7D32', color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>🇳🇬 Nigeria</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="#features" style={{ color: scrolled ? '#555' : 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 14px' }}>Features</a>
            <a href="#how-it-works" style={{ color: scrolled ? '#555' : 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 14px' }}>How It Works</a>
            <a href="#testimonials" style={{ color: scrolled ? '#555' : 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 14px' }}>Reviews</a>
            <Link to="/login" style={{ color: scrolled ? '#2E7D32' : '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', border: `2px solid ${scrolled ? '#2E7D32' : 'rgba(255,255,255,0.7)'}`, borderRadius: 8 }}>Login</Link>
            <Link to="/register" style={{ background: '#2E7D32', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 8 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #1565C0 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '100px 5% 80px',
        overflow: 'hidden',
      }}>
        <Particles />

        {/* Background circles */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 350, height: 350, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 0 }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 14 }}>🇳🇬</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>Nigeria's #1 Waste Management Platform</span>
            </div>

            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 24 }}>
              Cleaner Nigeria<br />
              <span style={{ color: '#A5D6A7' }}>Starts With You</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              Track waste schedules, find recycling centers, pay fees, report issues — all in one platform. Built for Nigerian communities from Lagos to Kano.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: '#fff', color: '#2E7D32', textDecoration: 'none',
                padding: '16px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16,
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                animation: 'pulse 3s ease infinite',
              }}>
                Get Started Free <MdArrowForward size={20} />
              </Link>
              <a href="#how-it-works" style={{
                background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none',
                padding: '16px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16,
                border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)',
              }}>
                Watch Demo ▶
              </a>
            </div>

            {/* Trust indicators */}
            <div style={{ marginTop: 48, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['🏙️', 'Lagos', 'Zone A-Z'], ['🌆', 'Abuja', 'FCT Zones'], ['🏘️', 'Port Harcourt', 'Rivers State']].map(([emoji, city, zone]) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{city}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{zone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'heroFloat 4s ease-in-out infinite' }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 24,
              padding: 28,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            }}>
              {/* Mock dashboard header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}><FaLeaf /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>WasteScheduler</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Good morning, Chidi 👋</div>
                </div>
                <div style={{ marginLeft: 'auto', background: '#E8F5E9', color: '#2E7D32', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Active</div>
              </div>

              {/* Next pickup banner */}
              <div style={{ background: 'linear-gradient(135deg,#2E7D32,#1B5E20)', borderRadius: 14, padding: '16px 20px', marginBottom: 16, color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>🗑️ Next Collection</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Organic Waste Pickup</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Tomorrow 7:00 AM · Lagos Island · Brown Bin</div>
              </div>

              {/* Stats mini grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['📅', '3', 'Pickups This Week'], ['♻️', '12kg', 'Waste Recycled'], ['🏆', '150', 'Eco Points'], ['💳', '₦2,000', 'Fee Paid']].map(([icon, val, label]) => (
                  <div key={label} style={{ background: '#F8FFF8', borderRadius: 10, padding: '12px 14px', border: '1px solid #E8F5E9' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{val}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Recycling categories */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[['#1976D2', 'Plastic'], ['#66BB6A', 'Glass'], ['#8D6E63', 'Organic'], ['#7E57C2', 'E-Waste']].map(([color, name]) => (
                  <div key={name} style={{ flex: 1, background: `${color}15`, borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 4px' }} />
                    <div style={{ fontSize: 9, color: '#666', fontWeight: 600 }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ──────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg,#1B5E20,#2E7D32,#1565C0)', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          <Counter target={50000} suffix="+" label="Registered Residents" />
          <Counter target={12} suffix="+" label="Nigerian Cities" />
          <Counter target={98} suffix="%" label="Collection Rate" />
          <Counter target={500} suffix="T" label="Waste Diverted Monthly" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 5%', background: '#F8FFF8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>FEATURES</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, margin: '16px 0 16px', color: '#1a1a2e' }}>
              Everything Your Community Needs
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
              Built specifically for Nigerian waste management challenges — from sachet water bags to generator batteries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            <FeatureCard delay={0} color="#2E7D32" icon={<MdSchedule size={26} />} title="Smart Collection Schedules" desc="View your personalized pickup dates by zone, category, and time. Get email and in-app reminders before every collection." />
            <FeatureCard delay={0.1} color="#1976D2" icon={<MdMap size={26} />} title="Nigeria Recycling Map" desc="Find the nearest recycling center in Lagos, Abuja, PH and 12 other cities. Filter by waste type and distance." />
            <FeatureCard delay={0.2} color="#FF9800" icon={<MdNotifications size={26} />} title="Smart Reminders" desc="Automated email and push notifications 24 hours and 2 hours before your pickup. Never miss a collection again." />
            <FeatureCard delay={0.3} color="#7E57C2" icon={<FaRecycle size={24} />} title="AI Waste Assistant" desc="Ask WasteBot anything — from where to dump your old Tecno phone to how to dispose of used engine oil." />
            <FeatureCard delay={0.4} color="#D32F2F" icon={<MdBarChart size={26} />} title="Eco Analytics" desc="Track your waste generation, see monthly summaries, and measure your environmental impact on the community." />
            <FeatureCard delay={0.5} color="#00796B" icon={<MdStar size={26} />} title="Eco Quiz & Gamification" desc="Play recycling quizzes, earn eco-points, win badges, and climb the community leaderboard. Works offline too!" />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#E3F2FD', color: '#1976D2', padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, margin: '16px 0', color: '#1a1a2e' }}>
              Three Simple Steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[
              { step: '01', icon: '📱', title: 'Create Your Account', desc: 'Sign up free with your email or Google account. Select your Nigerian state and LGA to get personalized schedules.' },
              { step: '02', icon: '🗓️', title: 'Check Your Schedule', desc: 'View upcoming pickup dates on your dashboard or calendar. Enable notifications for automatic reminders.' },
              { step: '03', icon: '♻️', title: 'Track & Contribute', desc: 'Log your waste, pay fees, report issues, and earn eco-points. Help build a cleaner Nigeria together.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', animation: `fadeInUp 0.6s ease ${i * 0.15}s both` }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#E8F5E9,#E3F2FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto', boxShadow: '0 4px 20px rgba(46,125,50,0.15)' }}>
                    {item.icon}
                  </div>
                  <div style={{ position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: '#2E7D32', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.step}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles section ─────────────────────────────────── */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg,#F1F8E9,#E3F2FD)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: '#1a1a2e' }}>Built for Everyone</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { role: 'Residents', icon: '🏠', color: '#2E7D32', desc: 'Track pickups, log waste, pay fees, submit reports, earn eco-points and quiz badges.', features: ['Pickup Calendar', 'Waste Log', 'Billing & Payments', 'Eco Quiz', 'AI Assistant'] },
              { role: 'Collectors', icon: '🚛', color: '#1976D2', desc: 'View assigned routes, mark collections complete, communicate with admin in real-time.', features: ['Assigned Pickups', 'Assignment Inbox', 'Collection History', 'Admin Messaging', 'Route Details'] },
              { role: 'Administrators', icon: '⚙️', color: '#FF9800', desc: 'Manage all aspects of the system — users, zones, schedules, billing, and performance analytics.', features: ['User Management', 'Assign Duties', 'Analytics', 'Billing', 'Announcements'] },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', borderTop: `4px solid ${item.color}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>{item.role}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>{item.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {item.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                      <span style={{ color: item.color, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section id="testimonials" style={{ padding: '100px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: '#FFF9C4', color: '#F57F17', padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>TESTIMONIALS</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, margin: '16px 0', color: '#1a1a2e' }}>
              What Nigerians Are Saying
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            <Testimonial name="Adaeze Okonkwo" role="Resident" city="Lagos Island" avatar="A" text="I never miss my pickup days anymore! The reminders come right to my email the night before. My street is cleaner than it's ever been." />
            <Testimonial name="Emeka Chukwu" role="PSP Collector" city="Ikeja, Lagos" avatar="E" text="The assignment feature makes it easy for me to know exactly which routes to cover each day. The admin can message me directly — no more phone tag!" />
            <Testimonial name="Fatima Bello" role="Admin Officer" city="Abuja, FCT" avatar="F" text="The analytics dashboard shows me exactly which zones are underperforming. Billing is automated and residents pay without stress. Brilliant system!" />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32,#1565C0)', padding: '100px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16, animation: 'rotateSlow 8s linear infinite', display: 'inline-block' }}>♻️</div>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Join the Green Revolution
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, lineHeight: 1.7, marginBottom: 40 }}>
            Register today for free and be part of building a cleaner, healthier Nigeria for future generations. 🇳🇬
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#fff', color: '#2E7D32', textDecoration: 'none', padding: '18px 40px', borderRadius: 14, fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              Create Free Account <MdArrowForward size={22} />
            </Link>
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', padding: '18px 32px', borderRadius: 14, fontWeight: 600, fontSize: 17, border: '2px solid rgba(255,255,255,0.35)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{ background: '#0D1117', padding: '60px 5% 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}><FaLeaf /></div>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>WasteScheduler</span>
              </div>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>Nigeria's smart waste management platform. Building cleaner communities across Lagos, Abuja, Port Harcourt and beyond.</p>
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                {[MdPhone, MdEmail, FaWhatsapp].map((Icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer' }}>
                    <Icon size={16} />
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Platform', links: ['Dashboard', 'Schedule', 'Recycling Map', 'Waste Guide', 'Billing'] },
              { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Use'] },
              { title: 'Support', links: ['Help Center', 'Report an Issue', 'LAWMA', 'PSP Operators'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.links.map(l => <li key={l} style={{ color: '#888', fontSize: 13, padding: '5px 0', cursor: 'pointer' }}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1a1a2e', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#666', fontSize: 13 }}>© {new Date().getFullYear()} WasteScheduler Nigeria. All rights reserved.</span>
            <div style={{ height: 4, width: 60, borderRadius: 2, background: 'linear-gradient(90deg,#008751 33%,#fff 33%,#fff 66%,#008751 66%)' }} />
            <span style={{ color: '#666', fontSize: 13 }}>Made with 💚 for a cleaner Nigeria 🇳🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
