import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdLock, MdVisibility, MdVisibilityOff, MdArrowForward, MdArrowBack } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { resetPassword } from '../api/auth';
import toast from 'react-hot-toast';

const PARTICLES = ['♻️','🌿','🍃','💚','🌱','🗑️'];

function LeftPanel() {
  return (
    <div className="auth-split__left">
      <div className="auth-deco-circle" style={{ width: 500, height: 500, top: '-160px', right: '-160px' }} />
      <div className="auth-deco-circle" style={{ width: 280, height: 280, bottom: '-80px', left: '-60px' }} />

      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            left: `${8 + (i * 9) % 85}%`,
            fontSize: `${14 + (i % 3) * 4}px`,
            animationDuration: `${11 + (i * 2) % 12}s`,
            animationDelay: `${(i * 1.5) % 7}s`,
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
          Set a new<br /><em>strong</em> password
        </h1>

        <p className="auth-split__sub">
          Choose a password that's hard to guess but easy to remember.
          You'll use it every time you sign in.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Strong Password Tips
          </div>
          {[
            '✅ At least 8 characters long',
            '✅ Mix uppercase and lowercase letters',
            '✅ Include at least one number',
            '✅ Add a special character (!, @, #...)',
          ].map((tip, i) => (
            <div key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.7 }}>
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-ng-bar" />
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  // Password strength meter
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#D32F2F', '#FF9800', '#1976D2', '#2E7D32'][strength];

  const onSubmit = async (data) => {
    if (!token) { toast.error('Missing reset token'); return; }
    setIsLoading(true);
    try {
      await resetPassword(token, data.password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <LeftPanel />

      <div className="auth-split__right">
        <div className="auth-split__form-wrap">

          {!done ? (
            <>
              <p className="auth-form-eyebrow">New Password</p>
              <h1 className="auth-form-title">Create your<br />new password</h1>
              <p className="auth-form-sub">
                {token
                  ? 'Enter your new password below. Make it something secure!'
                  : <span style={{ color: 'var(--color-danger)' }}>⚠ Invalid or missing reset token. Request a new link.</span>
                }
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* New password */}
                <div className="auth-field">
                  <label htmlFor="new-password">New Password</label>
                  <div className="auth-input-wrap">
                    <MdLock className="ai-icon" />
                    <input
                      id="new-password"
                      type={showPw ? 'text' : 'password'}
                      className={`auth-input has-right ${errors.password ? 'error' : ''}`}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
                      })}
                    />
                    <span
                      className="ai-icon-right"
                      onClick={() => setShowPw(s => !s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setShowPw(s => !s)}
                    >
                      {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="auth-field-error">⚠ {errors.password.message}</p>
                  )}

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background: i <= strength ? strengthColor : 'var(--color-border)',
                              transition: 'background 0.25s ease',
                            }}
                          />
                        ))}
                      </div>
                      {strengthLabel && (
                        <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>
                          {strengthLabel} password
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="auth-field">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <MdLock className="ai-icon" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      className={`auth-input has-right ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: v => v === password || 'Passwords do not match',
                      })}
                    />
                    <span
                      className="ai-icon-right"
                      onClick={() => setShowConfirm(s => !s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setShowConfirm(s => !s)}
                    >
                      {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="auth-field-error">⚠ {errors.confirmPassword.message}</p>
                  )}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading || !token}>
                  {isLoading ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                      Resetting...
                    </>
                  ) : (
                    <>Reset Password <MdArrowForward size={18} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Success ── */
            <div className="auth-success-box">
              <div className="auth-success-icon" style={{ background: 'rgba(46,125,50,0.1)', color: 'var(--color-primary)' }}>
                ✅
              </div>
              <p className="auth-form-eyebrow" style={{ textAlign: 'center' }}>All Done!</p>
              <h1 className="auth-form-title" style={{ textAlign: 'center' }}>
                Password reset<br />successfully!
              </h1>
              <p className="auth-form-sub" style={{ textAlign: 'center' }}>
                You'll be redirected to the sign-in page in a moment...
              </p>
              <div
                style={{
                  height: 4,
                  background: 'var(--color-border)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--color-primary)',
                    animation: 'progressBar 3s linear forwards',
                  }}
                />
              </div>
              <style>{`@keyframes progressBar { from { width: 0 } to { width: 100% } }`}</style>
            </div>
          )}

          <div className="auth-form-footer">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <MdArrowBack size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
