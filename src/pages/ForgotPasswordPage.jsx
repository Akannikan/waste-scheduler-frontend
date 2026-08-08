import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdCheckCircle } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { forgotPassword } from '../api/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await forgotPassword(data.email);
      setSent(true);
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl); // dev only
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-name">WasteScheduler</span>
        </div>

        {!sent ? (
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-icon"><MdEmail /></span>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email required' } })}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <MdCheckCircle size={56} style={{ color: 'var(--color-primary)', margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: 12 }}>Check your email</h2>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              If that email address is registered, a reset link has been sent.
            </p>
            {resetUrl && (
              <div className="alert alert-info" style={{ textAlign: 'left', wordBreak: 'break-all', fontSize: 12 }}>
                <strong>Dev mode reset link:</strong><br />
                <Link to={resetUrl.replace(window.location.origin, '')} style={{ color: 'var(--color-secondary)' }}>{resetUrl}</Link>
              </div>
            )}
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
