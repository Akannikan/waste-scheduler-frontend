import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Resident pages
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import CalendarPage from './pages/CalendarPage';
import WasteGuidePage from './pages/WasteGuidePage';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Collector pages
import CollectorDashboardPage from './pages/collector/CollectorDashboardPage';
import CollectorPickupsPage from './pages/collector/CollectorPickupsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminZonesPage from './pages/admin/AdminZonesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

import './styles.css';

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ── Resident routes ────────────────────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/schedule" element={
        <ProtectedRoute roles={['resident', 'admin']}>
          <AppLayout><SchedulePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute roles={['resident', 'admin']}>
          <AppLayout><CalendarPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/guide" element={
        <ProtectedRoute>
          <AppLayout><WasteGuidePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/map" element={
        <ProtectedRoute>
          <AppLayout><MapPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><ReportsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* ── Collector routes ───────────────────────────── */}
      <Route path="/collector/dashboard" element={
        <ProtectedRoute roles={['collector']}>
          <AppLayout><CollectorDashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/collector/pickups" element={
        <ProtectedRoute roles={['collector']}>
          <AppLayout><CollectorPickupsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/collector/history" element={
        <ProtectedRoute roles={['collector']}>
          <AppLayout><CollectorPickupsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* ── Admin routes ───────────────────────────────── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminDashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminUsersPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/schedules" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminSchedulesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminReportsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminAnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminAnalyticsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/zones" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminZonesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminCategoriesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/centers" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><MapPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* ── Smart root redirect ────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'collector') return <Navigate to="/collector/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#2E7D32', secondary: '#fff' } },
              error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' } },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
