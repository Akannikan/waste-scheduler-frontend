import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdArrowForward, MdArrowBack } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { forgotPassword } from '../api/auth';
import toast from 'react-hot-toast';

const PARTICLES = ['♻️','🌿','🍃','💚','🌱','🗑️','🔋','🌍'];

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
          Forgot your<br /><em>password?</em>
        </h1>

        <p className="auth-split__sub">
          No worries — it happens to everyone. Enter your email address and
          we'll send you a secure link to reset your password instantly.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 22px', marginTop: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Quick Tips
          </div>
          {[
            '🔍 Check your spam folder if you don\'t see the email',
            '⏰ The reset link is valid for 1 hour',
            '🔒 Choose a strong password with letters, numbers and symbols',
          ].map((tip, i) => (
            <div key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6, marginBottom: i < 2 ? 10 : 0 }}>
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-ng-bar" />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await forgotPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <LeftPanel />

      <div className="auth-split__right">
        <div className="auth-split__form-wrap">

          {!sent ? (
            <>
              <p className="auth-form-eyebrow">Password Reset</p>
              <h1 className="auth-form-title">Reset your<br />password</h1>
              <p className="auth-form-sub">
                We'll send a secure reset link to your registered email address.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="auth-field">
                  <label htmlFor="forgot-email">Email Address</label>
                  <div className="auth-input-wrap">
                    <MdEmail className="ai-icon" />
                    <input
                      id="forgot-email"
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

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                      Sending link...
                    </>
                  ) : (
                    <>Send Reset Link <MdArrowForward size={18} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="auth-success-box">
              <div className="auth-success-icon">✉️</div>

              <p className="auth-form-eyebrow" style={{ textAlign: 'center' }}>Email Sent</p>
              <h1 className="auth-form-title" style={{ textAlign: 'center' }}>
                Check your<br />inbox
              </h1>
              <p className="auth-form-sub" style={{ textAlign: 'center' }}>
                We sent a password reset link to<br />
                <strong style={{ color: 'var(--color-text)' }}>{sentEmail}</strong>
              </p>

              {/* Dev-mode reset URL */}
              {resetUrl && (
                <div
                  className="auth-demo-box"
                  style={{ textAlign: 'left', wordBreak: 'break-all', marginBottom: 20 }}
                >
                  <strong>🛠 Dev Mode — Reset Link:</strong><br />
                  <Link
                    to={resetUrl.replace(window.location.origin, '')}
                    style={{ color: 'var(--color-secondary)', fontSize: 12 }}
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}

              <div
                style={{
                  background: 'rgba(46,125,50,0.06)',
                  border: '1px solid rgba(46,125,50,0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                Didn't receive the email? Check spam, or{' '}
                <button
                  style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}
                  onClick={() => { setSent(false); setResetUrl(null); }}
                >
                  try again
                </button>
                .
              </div>
            </div>
          )}

          {/* Footer */}
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
