import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdLock, MdCheckCircle, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { resetPassword } from '../api/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!token) { toast.error('Missing reset token'); return; }
    setIsLoading(true);
    try {
      await resetPassword(token, data.password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
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

        {!done ? (
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">Choose a strong password for your account.</p>

            {!token && <div className="alert alert-error">Invalid or missing reset token.</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <span className="input-icon"><MdLock /></span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="At least 6 characters"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  />
                  <span className="input-icon-right" onClick={() => setShowPw((s) => !s)} role="button" tabIndex={0}>
                    {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading || !token}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <MdCheckCircle size={56} style={{ color: 'var(--color-primary)', margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: 8 }}>Password reset!</h2>
            <p className="text-muted">Redirecting you to login...</p>
          </div>
        )}

        <div className="auth-footer"><Link to="/login">← Back to Sign In</Link></div>
      </div>
    </div>
  );
}
