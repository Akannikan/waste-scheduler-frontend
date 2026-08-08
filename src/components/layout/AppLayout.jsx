import { useState } from 'react';
import { MdMenu, MdClose } from 'react-icons/md';
import { BsSun, BsMoon } from 'react-icons/bs';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        {/* Mobile top bar */}
        <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen((o) => !o)}
            style={{ display: 'none' }}
            id="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>

          <div style={{ flex: 1 }} />

          <button
            className="btn btn-ghost btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>
        </div>

        {children}
      </main>

      {/* Inline style to show toggle on mobile */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
