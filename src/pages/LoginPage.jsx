import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward, MdHome } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function playLoginSound() {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    // Audio is optional and may be unavailable in some browsers.
  }
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
      playLoginSound();
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 🎉`);
      const dest = from || '/dashboard';
      navigate(dest, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-split auth-login-shell">
      {/* ── Right panel ─────────────────────────────────── */}
      <div className="auth-split__right">
        <Link to="/" className="auth-home-link" aria-label="Back to home">
          <MdHome size={18} />
          <span>Home</span>
        </Link>
        <div className="auth-split__form-wrap">

          <div className="auth-login-brand">
            <div className="auth-login-brand-icon"><FaLeaf /></div>
            <span>Waste Tracker</span>
          </div>

          <p className="auth-form-eyebrow">Welcome Back</p>
          <h1 className="auth-form-title">Sign in to your<br />account</h1>
          <p className="auth-form-sub">
            Nigeria's smart waste management platform 🇳🇬
          </p>

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

    </div>
  );
}
