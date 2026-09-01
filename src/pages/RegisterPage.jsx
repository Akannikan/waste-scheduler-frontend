import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdPerson, MdEmail, MdLock, MdPhone, MdLocationOn,
  MdVisibility, MdVisibilityOff, MdArrowForward, MdArrowBack, MdHome,
  MdCheckCircle,
} from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getZones } from '../api';
import toast from 'react-hot-toast';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const PARTICLES = ['🛍️', '🧻', '📱', '💻', '🔌', '🧴', '🍾', '🧪', '📦', '🥫', '🗞️'];

function LeftPanel() {
  return (
    <div className="auth-split__left">
      <div className="auth-deco-circle" style={{ width: 500, height: 500, top: '-160px', right: '-160px' }} />
      <div className="auth-deco-circle" style={{ width: 300, height: 300, bottom: '-80px', left: '-80px' }} />

      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            left: `${30 + (i * 7) % 40}%`,
            fontSize: `${13 + (i % 4) * 4}px`,
            animationDuration: '8s',
            animationDelay: `${(i * 1.3) % 8}s`,
            opacity: 0.7,
          }}
        >
          {PARTICLES[i % PARTICLES.length]}
        </span>
      ))}

      <div className="auth-split__brand">
        <div className="auth-split__brand-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        <h1 className="auth-split__headline">
          Join the <em>Green</em><br />Revolution
        </h1>

        <p className="auth-split__sub">
          Create your free account and start tracking your waste, finding recycling centers,
          and earning eco-points in your Nigerian community.
        </p>

        {/* Feature checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            '📅 View your personalised pickup calendar',
            '♻️ Find recycling centers near you on the map',
            '🎮 Play eco quizzes and earn badges',
            '💳 Manage waste fees in Nigerian Naira (₦)',
            '🤖 Ask WasteBot any waste disposal question',
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'rgba(255,255,255,0.82)',
                fontSize: 14,
                animation: `fadeInUp 0.5s ease ${i * 0.1 + 0.1}s both`,
              }}
            >
              <MdCheckCircle size={16} style={{ color: '#A5D6A7', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-ng-bar" />
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            background: i < current
              ? 'var(--color-primary)'
              : i === current
                ? 'var(--color-primary)'
                : 'var(--color-border)',
            opacity: i === current ? 1 : i < current ? 0.7 : 0.35,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);          // 0 = credentials, 1 = location
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [stateLgas, setStateLgas] = useState([]);
  const [formData, setFormData] = useState({});
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');

  // Step 0 form
  const {
    register: reg0,
    handleSubmit: submit0,
    formState: { errors: err0 },
  } = useForm();

  // Step 1 form
  const {
    register: reg1,
    handleSubmit: submit1,
    watch: watch1,
    setValue: setValue1,
    formState: { errors: err1 },
  } = useForm();

  const selectedState = watch1('state');
  const selectedZoneId = watch1('zoneId');
  const selectedZone = zones.find(zone => String(zone.id) === String(selectedZoneId));

  useEffect(() => {
    setValue1('zoneId', '');
    if (!selectedState) return;
  }, [selectedState, setValue1]);

  useEffect(() => {
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
  }, []);

  const detectLocation = () => {
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError('Location detection requires a secure browser connection. Please enter your location manually.');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          addressdetails: '1',
          lat: String(coords.latitude),
          lon: String(coords.longitude),
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const result = await response.json();
        const address = result.address || {};
        const detectedState = NIGERIAN_STATES.find(state =>
          state.toLowerCase() === String(address.state || '').toLowerCase()
        );
        if (!detectedState) throw new Error('We could not identify a supported Nigerian state at this location.');

        const detectedAddress = result.display_name || [address.house_number, address.road].filter(Boolean).join(' ');

        setValue1('state', detectedState);
        setValue1('address', detectedAddress);
        const matchingZone = zones.find(zone => zone.state === detectedState);
        window.setTimeout(() => {
          setValue1('zoneId', matchingZone ? String(matchingZone.id) : '');
        }, 0);
        setLocationStatus('success');
        if (!matchingZone) setLocationError('Location detected. Please choose your collection zone manually.');
      } catch (error) {
        setLocationStatus('error');
        setLocationError(error.message || 'Location could not be detected. Please enter it manually.');
      }
    }, (error) => {
      setLocationStatus('error');
      setLocationError(error.code === error.PERMISSION_DENIED
        ? 'Location permission was denied. You can enter your location manually.'
        : 'Location could not be detected. Please enter it manually.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  // Step 0 → validate credentials, move to step 1
  const onStep0 = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(1);
  };

  // Step 1 → final submit
  const onStep1 = async (data) => {
    const merged = { ...formData, ...data };
    setIsLoading(true);
    const result = await registerUser({
      name: merged.name,
      email: merged.email,
      password: merged.password,
      phone: merged.phone || undefined,
      state: merged.state || undefined,
      address: merged.address || undefined,
      zoneId: merged.zoneId ? Number(merged.zoneId) : undefined,
      role: 'resident',
    });
    setIsLoading(false);
    if (result.success) {
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
      setStep(0); // Go back if email conflict
    }
  };

  return (
    <div className="auth-split auth-register-shell">
      <LeftPanel />

      {/* ── Right panel ──────────────────────────────────── */}
      <div className="auth-split__right scrollable">
        <Link to="/" className="auth-home-link" aria-label="Back to home">
          <MdHome size={18} />
          <span>Home</span>
        </Link>
        <div className="auth-split__form-wrap">

          {/* Step indicator */}
          <StepIndicator current={step} total={2} />

          <p className="auth-form-eyebrow">
            {step === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}
          </p>
          <h1 className="auth-form-title">
            {step === 0 ? 'Create your\naccount' : 'Your location\nin Nigeria'}
          </h1>
          <p className="auth-form-sub">
            {step === 0
              ? 'Join thousands of Nigerians managing waste responsibly 🇳🇬'
              : 'Help us show you the right pickup schedules and recycling centers.'}
          </p>

          {/* ── STEP 0: Credentials ───────────────────── */}
          {step === 0 && (
            <>
              <form onSubmit={submit0(onStep0)} noValidate>
                <div className="auth-grid-2">
                  {/* Name */}
                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label>Full Name *</label>
                    <div className="auth-input-wrap">
                      <MdPerson className="ai-icon" />
                      <input
                        type="text"
                        className={`auth-input ${err0.name ? 'error' : ''}`}
                        placeholder="Chidi Okonkwo"
                        autoComplete="name"
                        {...reg0('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Too short' },
                        })}
                      />
                    </div>
                    {err0.name && <p className="auth-field-error">⚠ {err0.name.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label>Phone *</label>
                    <div className="auth-input-wrap">
                      <MdPhone className="ai-icon" />
                      <input
                        type="tel"
                        className={`auth-input ${err0.phone ? 'error' : ''}`}
                        placeholder="+234 801 234 5678"
                        autoComplete="tel"
                        {...reg0('phone', { required: 'Phone number is required' })}
                      />
                    </div>
                    {err0.phone && <p className="auth-field-error">⚠ {err0.phone.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field" style={{ marginTop: 14 }}>
                  <label>Email Address *</label>
                  <div className="auth-input-wrap">
                    <MdEmail className="ai-icon" />
                    <input
                      type="email"
                      className={`auth-input ${err0.email ? 'error' : ''}`}
                      placeholder="chidi@example.com"
                      autoComplete="email"
                      {...reg0('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email',
                        },
                      })}
                    />
                  </div>
                  {err0.email && <p className="auth-field-error">⚠ {err0.email.message}</p>}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label>Password *</label>
                  <div className="auth-input-wrap">
                    <MdLock className="ai-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`auth-input has-right ${err0.password ? 'error' : ''}`}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      {...reg0('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
                      })}
                    />
                    <span
                      className="ai-icon-right"
                      onClick={() => setShowPassword(s => !s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setShowPassword(s => !s)}
                    >
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </span>
                  </div>
                  {err0.password && <p className="auth-field-error">⚠ {err0.password.message}</p>}
                </div>

                <button type="submit" className="auth-submit-btn">
                  Continue <MdArrowForward size={18} />
                </button>
              </form>
            </>
          )}

          {/* ── STEP 1: Location ──────────────────────── */}
          {step === 1 && (
            <form onSubmit={submit1(onStep1)} noValidate>
              <div className="location-detect-panel">
                <div>
                  <strong>Find your location automatically</strong>
                  <p>Allow location access to prefill your state, address, and zone.</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={detectLocation} disabled={locationStatus === 'loading'}>
                  <MdLocationOn /> {locationStatus === 'loading' ? 'Detecting...' : 'Use my location'}
                </button>
              </div>
              {locationStatus === 'success' && !locationError && <p className="location-detect-success">Location detected. You can review or edit the details below.</p>}
              {locationError && <p className="location-detect-error">{locationError}</p>}

              {/* State */}
              <div className="auth-field" style={{ marginBottom: 14 }}>
                <label>State *</label>
                <select className={`auth-select ${err1.state ? 'error' : ''}`} {...reg1('state', { required: 'State is required' })}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {err1.state && <p className="auth-field-error">⚠ {err1.state.message}</p>}
              </div>

              {/* Address */}
              <div className="auth-field" style={{ marginTop: 14 }}>
                  <label>Home Address *</label>
                <div className="auth-input-wrap">
                  <MdLocationOn className="ai-icon" />
                  <input
                    type="text"
                    className={`auth-input ${err1.address ? 'error' : ''}`}
                    placeholder="14 Broad Street, Lagos Island"
                    autoComplete="street-address"
                    {...reg1('address', { required: 'Home address is required' })}
                  />
                </div>
                {err1.address && <p className="auth-field-error">⚠ {err1.address.message}</p>}
              </div>

              {/* Zone — filtered by state */}
              <div className="auth-field">
                <label>Collection Zone *</label>
                <select className={`auth-select ${err1.zoneId ? 'error' : ''}`} {...reg1('zoneId', { required: 'Collection zone is required' })}>
                  <option value="">{zones.length ? 'Select your zone' : 'No zones available'}</option>
                  {zones
                    .filter(z => z.state === selectedState)
                    .map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code}){z.state ? ` — ${z.state}` : ''}
                      </option>
                    ))}
                </select>
                {err1.zoneId && <p className="auth-field-error">⚠ {err1.zoneId.message}</p>}
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 5 }}>
                  Your zone determines your pickup schedule
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', flex: '0 0 48px', padding: '14px', minWidth: 0 }}
                  onClick={() => setStep(0)}
                >
                  <MdArrowBack size={18} />
                </button>
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                      Creating account...
                    </>
                  ) : (
                    <>Create Account <MdArrowForward size={18} /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="auth-form-footer" style={{ marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
