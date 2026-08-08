import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdPerson, MdEmail, MdLock, MdPhone, MdLocationOn, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getZones } from '../api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    getZones().then((res) => setZones(res.data.zones || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: data.address,
      zoneId: data.zoneId || undefined,
      role: 'resident',
    });
    setIsLoading(false);

    if (result.success) {
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join your community waste management system</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-icon"><MdPerson /></span>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="Adeleke Ishola"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                />
              </div>
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone (optional)</label>
              <div className="input-group">
                <span className="input-icon"><MdPhone /></span>
                <input type="tel" className="form-control" placeholder="+234 -- -- --" {...register('phone')} />
              </div>
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-icon"><MdEmail /></span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="ishola@gmail.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-icon"><MdLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="At least 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              />
              <span className="input-icon-right" onClick={() => setShowPassword((s) => !s)} role="button" tabIndex={0}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Home Address (optional)</label>
            <div className="input-group">
              <span className="input-icon"><MdLocationOn /></span>
              <input type="text" className="form-control" placeholder="123 Main Street" {...register('address')} />
            </div>
          </div>

          {zones.length > 0 && (
            <div className="form-group">
              <label className="form-label">Collection Zone</label>
              <select className="form-control" {...register('zoneId')}>
                <option value="">Select your zone (optional)</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
