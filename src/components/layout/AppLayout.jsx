import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdMenu, MdClose, MdLogout, MdPerson, MdNotifications, MdDashboard, MdSchedule, MdPayment, MdHome, MdStar } from 'react-icons/md';
import { BsSun, BsMoon } from 'react-icons/bs';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ReviewPrompt from '../common/ReviewPrompt';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const welcomeStarted = useRef(false);
  const welcomeNameRef = useRef(null);
  const [welcomeNameMarquee, setWelcomeNameMarquee] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAdmin, isCollector } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateWelcomeName = () => {
      const element = welcomeNameRef.current;
      setWelcomeNameMarquee(Boolean(element && element.scrollWidth > element.clientWidth));
    };
    updateWelcomeName();
    window.addEventListener('resize', updateWelcomeName);
    return () => window.removeEventListener('resize', updateWelcomeName);
  }, [user?.name]);

  useEffect(() => {
    if (!user?.id || welcomeStarted.current || !window.speechSynthesis) return undefined;

    const pendingUserId = localStorage.getItem('pendingWelcomeUserId');
    if (pendingUserId !== String(user.id)) return undefined;

    welcomeStarted.current = true;
    localStorage.removeItem('pendingWelcomeUserId');
    const firstName = user.name?.trim().split(/\s+/)[0] || 'there';
    const welcome = new SpeechSynthesisUtterance(`Welcome, ${firstName}`);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(welcome);

    return () => window.speechSynthesis.cancel();
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (localStorage.getItem('siteReviewSubmitted') === 'true') return undefined;
    const startedAt = Number(localStorage.getItem('reviewSessionStartedAt')) || Date.now();
    localStorage.setItem('reviewSessionStartedAt', String(startedAt));
    const remaining = Math.max(0, (4 * 60 * 1000) - (Date.now() - startedAt));
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

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const mobileNavItems = isAdmin
    ? [
        { to: '/admin/dashboard', icon: <MdDashboard />, label: 'Home' },
        { to: '/admin/schedules', icon: <MdSchedule />, label: 'Schedules' },
        { to: '/admin/billing', icon: <MdPayment />, label: 'Billing' },
        { to: '/notifications', icon: <MdNotifications />, label: 'Alerts' },
        { to: '/profile', icon: <MdPerson />, label: 'Profile' },
      ]
    : isCollector
      ? [
          { to: '/collector/dashboard', icon: <MdDashboard />, label: 'Home' },
          { to: '/collector/pickups', icon: <MdSchedule />, label: 'Jobs' },
          { to: '/notifications', icon: <MdNotifications />, label: 'Alerts' },
          { to: '/profile', icon: <MdPerson />, label: 'Profile' },
        ]
      : [
          { to: '/dashboard', icon: <MdHome />, label: 'Home' },
          { to: '/schedule', icon: <MdSchedule />, label: 'Schedule' },
          { to: '/billing', icon: <MdPayment />, label: 'Billing' },
          { to: '/business', icon: <MdPayment />, label: 'Business' },
          { to: '/notifications', icon: <MdNotifications />, label: 'Alerts' },
          { to: '/profile', icon: <MdPerson />, label: 'Profile' },
        ];

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="app-topbar">
          <button
            id="sidebar-toggle"
            className="btn btn-ghost btn-icon app-menu-button"
            onClick={() => {
              setSidebarOpen(o => !o);
              setSidebarCollapsed(o => !o);
            }}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen || !sidebarCollapsed}
          >
            <MdMenu size={22} />
          </button>

          <div ref={welcomeNameRef} className={`app-topbar__greeting ${welcomeNameMarquee ? 'is-marquee' : ''}`}>
            <span className="app-topbar__greeting-track">
              <span className="app-topbar__eyebrow">Welcome back</span>
              <strong>{user?.name}</strong>
            </span>
          </div>

          <div className="app-topbar__actions">
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <BsSun size={18} /> : <BsMoon size={18} />}
            </button>

            <div className="notification-bell-wrap">
              <button className="btn btn-ghost btn-icon" onClick={() => navigate('/notifications')} title="Notifications">
                <MdNotifications size={20} />
              </button>
            </div>

            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setReviewOpen(true)}
              title="Rate WasteScheduler"
              aria-label="Rate WasteScheduler"
            >
              <MdStar size={20} />
            </button>

            <button
              className="topbar-profile"
              onClick={() => navigate('/profile')}
              title="Profile"
            >
              <div className="topbar-avatar">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Profile" /> : initials}
              </div>
              <span>{user?.name?.split(' ')[0]}</span>
            </button>

            <button
              className="btn btn-ghost btn-icon danger-icon"
              onClick={handleLogout}
              title="Logout"
            >
              <MdLogout size={20} />
            </button>
          </div>
        </header>

        {children}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => {
          const active = location.pathname === item.to || (item.to !== '/notifications' && location.pathname.startsWith(item.to));
          return (
            <button
              key={item.to}
              type="button"
              className={`mobile-nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.to)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {reviewOpen && <ReviewPrompt onClose={() => {
        setReviewOpen(false);
        if (pendingLogout) {
          setPendingLogout(false);
          completeLogout();
        }
      }} onSubmitted={handleReviewSubmitted} />}

    </div>
  );
}
