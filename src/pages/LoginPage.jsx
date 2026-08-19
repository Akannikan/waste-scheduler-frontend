import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward, MdHome } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ── Floating background particles ──────────────────────────────
const PARTICLES = ['🛍️', '🧻', '📱', '💻', '🔌', '🧴', '🍾', '📦', '🥫', '🗞️'];

function LeftPanel() {
  return (
    <div className="auth-split__left">
      {/* Decorative circles */}
      <div className="auth-deco-circle" style={{ width: 500, height: 500, top: '-160px', right: '-160px' }} />
      <div className="auth-deco-circle" style={{ width: 300, height: 300, bottom: '-80px', left: '-80px' }} />
      <div className="auth-deco-circle" style={{ width: 180, height: 180, top: '45%', left: '60%' }} />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            left: `${30 + (i * 7) % 40}%`,
            fontSize: `${13 + (i % 4) * 4}px`,
            animationDuration: `${10 + (i * 3) % 14}s`,
            animationDelay: `${(i * 1.3) % 8}s`,
            opacity: 0.7,
          }}
        >
          {PARTICLES[i % PARTICLES.length]}
        </span>
      ))}

      <div className="auth-split__brand">
        {/* Logo */}
        <div className="auth-split__brand-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        {/* Headline */}
        <h1 className="auth-split__headline">
          Building a <em>Cleaner</em><br />Nigeria Together
        </h1>

        <p className="auth-split__sub">
          Track collections, find recycling centers, pay fees, and earn eco-points —
          all in one platform built for Nigerian communities.
        </p>

      </div>

      <div className="auth-waste-bin" aria-hidden="true"><span>♻</span></div>
      {/* Nigerian flag bar */}
      <div className="auth-ng-bar" />
    </div>
  );
}

// ── Google SVG icon ────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Main Login Page ────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const from = location.state?.from?.pathname;

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 🎉`);
      const dest = from || (
        result.user.role === 'admin' ? '/admin/dashboard' :
        result.user.role === 'collector' ? '/collector/dashboard' :
        '/dashboard'
      );
      navigate(dest, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-split">
      <LeftPanel />

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="auth-split__right">
        <Link to="/" className="auth-home-link" aria-label="Back to home">
          <MdHome size={18} />
          <span>Home</span>
        </Link>
        <div className="auth-split__form-wrap">

          {/* Mobile logo (hidden on desktop, left panel handles it) */}
          <div style={{ display: 'none' }} className="auth-mobile-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                <FaLeaf />
              </div>
              <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>WasteScheduler</span>
            </div>
          </div>

          <p className="auth-form-eyebrow">Welcome Back</p>
          <h1 className="auth-form-title">Sign in to your<br />account</h1>
          <p className="auth-form-sub">
            Nigeria's smart waste management platform 🇳🇬
          </p>

          {/* Google */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <MdEmail className="ai-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="auth-field-error">⚠ {errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-row-between">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <MdLock className="ai-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input has-right ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                />
                <span
                  className="ai-icon-right"
                  onClick={() => setShowPassword(s => !s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </span>
              </div>
              {errors.password && (
                <p className="auth-field-error">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <MdArrowForward size={18} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-form-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>

        </div>
      </div>

      {/* Mobile-only logo fix */}
      <style>{`
        @media (max-width: 900px) {
          .auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
