import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaLeaf, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
      toast.success(`Welcome back, ${result.user.name}!`);
      const redirectTo = from || (result.user.role === 'admin' ? '/admin/dashboard' : result.user.role === 'collector' ? '/collector/dashboard' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Track waste schedules and recycling activities 🇳🇬</p>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn w-full"
          style={{ background: '#fff', border: '2px solid #e5e7eb', color: '#374151', marginBottom: 16, gap: 12, justifyContent: 'center', padding: '12px', fontSize: 15 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-icon"><MdEmail /></span>
              <input type="email" className={`form-control ${errors.email ? 'error' : ''}`} placeholder="you@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Forgot?</Link>
            </div>
            <div className="input-group">
              <span className="input-icon"><MdLock /></span>
              <input type={showPassword ? 'text' : 'password'} className={`form-control ${errors.password ? 'error' : ''}`} placeholder="Your password"
                {...register('password', { required: 'Password is required' })}
              />
              <span className="input-icon-right" onClick={() => setShowPassword(s => !s)} role="button" tabIndex={0}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="alert alert-info mt-4" style={{ fontSize: 12 }}>
          <div>
            <strong>🇳🇬 Demo Accounts:</strong><br />
            Admin: admin@wastescheduler.ng / Admin@123<br />
            Resident: resident@wastescheduler.ng / Resident@123<br />
            Collector: collector@wastescheduler.ng / Collector@123
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

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
      toast.success(`Welcome back, ${result.user.name}!`);
      const redirectTo = from || (
        result.user.role === 'admin' ? '/admin/dashboard' :
        result.user.role === 'collector' ? '/collector/dashboard' :
        '/dashboard'
      );
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Track waste schedules and recycling activities</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-icon"><MdEmail /></span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="yourgamil@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-icon"><MdLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Your password"
                {...register('password', { required: 'Password is required' })}
              />
              <span className="input-icon-right" onClick={() => setShowPassword((s) => !s)} role="button" tabIndex={0}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="alert alert-info mt-4" style={{ fontSize: 12 }}>
          <div>
            <strong>🇳🇬 Demo Accounts:</strong><br />
            Admin: admin@wastescheduler.ng / Admin@123<br />
            Resident: resident@wastescheduler.ng / Resident@123<br />
            Collector: collector@wastescheduler.ng / Collector@123
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
