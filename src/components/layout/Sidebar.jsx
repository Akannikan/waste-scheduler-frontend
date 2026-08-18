import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdCalendarToday, MdMap, MdNotifications,
  MdReport, MdPerson, MdLogout, MdRecycling, MdSchedule,
  MdAnnouncement, MdBarChart, MdPeople, MdLocationCity,
  MdCategory, MdRoute, MdHistory, MdMenuBook, MdPayment,
  MdGames, MdDeleteSweep, MdAccountBalance, MdAssignment,
} from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const residentNav = [
  { to: '/dashboard',     icon: <MdDashboard />,     label: 'Dashboard' },
  { to: '/schedule',      icon: <MdSchedule />,      label: 'Schedule' },
  { to: '/calendar',      icon: <MdCalendarToday />, label: 'Calendar' },
  { to: '/waste-log',     icon: <MdDeleteSweep />,   label: 'Waste Log' },
  { to: '/guide',         icon: <MdMenuBook />,      label: 'Waste Guide' },
  { to: '/map',           icon: <MdMap />,           label: 'Recycling Map' },
  { to: '/reports',       icon: <MdReport />,        label: 'My Reports' },
  { to: '/billing',       icon: <MdPayment />,       label: 'Billing & Fees' },
  { to: '/quiz',          icon: <MdGames />,         label: 'Eco Quiz 🎮' },
  { to: '/notifications', icon: <MdNotifications />, label: 'Notifications' },
  { to: '/profile',       icon: <MdPerson />,        label: 'Profile' },
];

const collectorNav = [
  { to: '/collector/dashboard',   icon: <MdDashboard />,   label: 'Dashboard' },
  { to: '/collector/pickups',     icon: <MdRoute />,       label: 'Assigned Pickups' },
  { to: '/collector/assignments', icon: <MdAssignment />,  label: 'My Assignments' },
  { to: '/collector/history',     icon: <MdHistory />,     label: 'Collection History' },
  { to: '/notifications',         icon: <MdNotifications />, label: 'Notifications' },
  { to: '/profile',               icon: <MdPerson />,      label: 'Profile' },
];

const adminNav = [
  { to: '/admin/dashboard',     icon: <MdDashboard />,      label: 'Dashboard' },
  { to: '/admin/users',         icon: <MdPeople />,         label: 'Users' },
  { to: '/admin/zones',         icon: <MdLocationCity />,   label: 'Zones' },
  { to: '/admin/categories',    icon: <MdCategory />,       label: 'Categories' },
  { to: '/admin/schedules',     icon: <MdSchedule />,       label: 'Schedules' },
  { to: '/admin/assignments',   icon: <MdAssignment />,     label: 'Assignments' },
  { to: '/admin/reports',       icon: <MdReport />,         label: 'Reports' },
  { to: '/admin/billing',       icon: <MdAccountBalance />, label: 'Billing' },
  { to: '/admin/announcements', icon: <MdAnnouncement />,   label: 'Announcements' },
  { to: '/admin/notifications', icon: <MdNotifications />,  label: 'Notifications' },
  { to: '/admin/analytics',     icon: <MdBarChart />,       label: 'Analytics' },
  { to: '/admin/centers',       icon: <MdRecycling />,      label: 'Recycling Centers' },
  { to: '/profile',             icon: <MdPerson />,         label: 'Profile' },
];

export default function Sidebar({ open, onClose, onLogout }) {
  const { user, isAdmin, isCollector } = useAuth();

  const navItems = isAdmin ? adminNav : isCollector ? collectorNav : residentNav;

  const handleLogout = () => onLogout?.();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={onClose} />

      <nav className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><FaLeaf /></div>
          <span className="logo-text">WasteScheduler</span>
        </div>

        {/* Nav links */}
        <div className="sidebar-nav">
          <div className="nav-section-label">
            {isAdmin ? 'Administration' : isCollector ? 'Collector' : 'Resident'}
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          <div className="nav-item" style={{ cursor: 'default', opacity: 0.72, marginBottom: 4 }}>
            <span className="nav-icon"><MdPerson /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 155 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                {user?.role}{user?.state ? ` · ${user.state}` : ''}
              </div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ color: '#FC8181', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <span className="nav-icon"><MdLogout /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
