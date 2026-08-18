import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdClose, MdLogout, MdPerson, MdNotifications } from 'react-icons/md';
import { BsSun, BsMoon } from 'react-icons/bs';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../api';
import toast from 'react-hot-toast';
import ReviewPrompt from '../common/ReviewPrompt';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotifications();
      const unread = res.data.notifications?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('siteReviewSubmitted') === 'true') return undefined;
    const startedAt = Number(localStorage.getItem('reviewSessionStartedAt')) || Date.now();
    localStorage.setItem('reviewSessionStartedAt', String(startedAt));
    const remaining = Math.max(0, (5 * 60 * 1000) - (Date.now() - startedAt));
    const timer = window.setTimeout(() => setReviewOpen(true), remaining);
    return () => window.clearTimeout(timer);
  }, []);

  const completeLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleLogout = () => {
    if (localStorage.getItem('siteReviewSubmitted') !== 'true') {
      setPendingLogout(true);
      setReviewOpen(true);
      return;
    }
    completeLogout();
  };

  const handleReviewSubmitted = () => {
    setReviewOpen(false);
    if (pendingLogout) completeLogout();
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      <main className="main-content">
        {/* Topbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          padding: '10px 16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 12,
          zIndex: 90,
        }}>
          {/* Left — hamburger (mobile) */}
          <button
            id="sidebar-toggle"
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
            style={{ display: 'none' }}
          >
            {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>

          {/* Middle — breadcrumb / greeting */}
          <div style={{ flex: 1, paddingLeft: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-muted)' }}>
              Welcome back, <span style={{ color: 'var(--color-primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </span>
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Theme toggle */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <BsSun size={18} /> : <BsMoon size={18} />}
            </button>

            {/* Notifications bell */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => navigate('/notifications')} title="Notifications">
                <MdNotifications size={20} />
              </button>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid var(--color-surface)'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>

            {/* Avatar */}
            <button
              className="btn btn-ghost"
              style={{ padding: '4px 10px', gap: 8, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              onClick={() => navigate('/profile')}
              title="Profile"
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, overflow: 'hidden',
              }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {/* Logout button */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleLogout}
              title="Logout"
              style={{ color: 'var(--color-danger)' }}
            >
              <MdLogout size={20} />
            </button>
          </div>
        </div>

        {children}
      </main>

      {reviewOpen && <ReviewPrompt onClose={() => { setReviewOpen(false); setPendingLogout(false); }} onSubmitted={handleReviewSubmitted} />}

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
