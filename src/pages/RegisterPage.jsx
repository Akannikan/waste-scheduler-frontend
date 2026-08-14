import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdPerson, MdEmail, MdLock, MdPhone, MdLocationOn,
  MdVisibility, MdVisibilityOff,
} from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getZones } from '../api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedState = watch('state');

  useEffect(() => {
    getZones()
      .then(res => setZones(res.data.zones || []))
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
      address: data.address || undefined,
      state: data.state || undefined,
      lga: data.lga || undefined,
      zoneId: data.zoneId ? Number(data.zoneId) : undefined,
      role: 'resident',
    });
    setIsLoading(false);
    if (result.success) {
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Nigeria's smart waste management community 🇳🇬</p>

        {/* Google signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn w-full"
          style={{
            background: '#fff',
            border: '2px solid #e5e7eb',
            color: '#374151',
            marginBottom: 16,
            gap: 10,
            justifyContent: 'center',
            padding: '12px',
            fontSize: 15,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>or register with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Name + Phone */}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <div className="input-group">
                <span className="input-icon"><MdPerson /></span>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="Chidi Okonkwo"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Too short' },
                  })}
                />
              </div>
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone (optional)</label>
              <div className="input-group">
                <span className="input-icon"><MdPhone /></span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+234 801 234 5678"
                  {...register('phone')}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="form-group mt-2">
            <label className="form-label">Email Address *</label>
            <div className="input-group">
              <span className="input-icon"><MdEmail /></span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="chidi@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-group">
              <span className="input-icon"><MdLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Minimum 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              <span
                className="input-icon-right"
                onClick={() => setShowPassword(s => !s)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setShowPassword(s => !s)}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {/* State + LGA */}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">State</label>
              <select className="form-control" {...register('state')}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">LGA</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ikeja"
                {...register('lga')}
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group mt-2">
            <label className="form-label">Home Address (optional)</label>
            <div className="input-group">
              <span className="input-icon"><MdLocationOn /></span>
              <input
                type="text"
                className="form-control"
                placeholder="14 Broad Street, Lagos Island"
                {...register('address')}
              />
            </div>
          </div>

          {/* Zone */}
          {zones.length > 0 && (
            <div className="form-group">
              <label className="form-label">Collection Zone</label>
              <select className="form-control" {...register('zoneId')}>
                <option value="">Select your zone (optional)</option>
                {zones
                  .filter(z => !selectedState || z.state === selectedState || !z.state)
                  .map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code}){z.state ? ` — ${z.state}` : ''}
                    </option>
                  ))}
              </select>
              <p className="form-hint">Your zone determines your pickup schedule</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</>
              : 'Create Account'
            }
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
