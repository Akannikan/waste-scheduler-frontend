import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AnimatedBackground from './components/common/AnimatedBackground';

// Public pages
import LandingPage from './pages/LandingPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Resident pages
import DashboardPage from './pages/DashboardPage';
// Non-MVP: import SchedulePage from './pages/SchedulePage';
// Non-MVP: import CalendarPage from './pages/CalendarPage';
// Non-MVP: import WasteGuidePage from './pages/WasteGuidePage';
import MapPage from './pages/MapPage';
// Non-MVP: import ReportsPage from './pages/ReportsPage';
// Non-MVP: import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import WasteLogPage from './pages/WasteLogPage';
import BillingPage from './pages/BillingPage';
// Non-MVP: import QuizPage from './pages/QuizPage';

// Non-MVP: Collector pages
// Non-MVP: import CollectorDashboardPage from './pages/collector/CollectorDashboardPage';
// Non-MVP: import CollectorPickupsPage from './pages/collector/CollectorPickupsPage';
// Non-MVP: import CollectorHistoryPage from './pages/collector/CollectorHistoryPage';
// Non-MVP: import CollectorAssignmentsPage from './pages/collector/CollectorAssignmentsPage';
// Non-MVP: import CollectorEarningsPage from './pages/collector/CollectorEarningsPage';
// Non-MVP: import CollectorWithdrawalsPage from './pages/collector/CollectorWithdrawalsPage';
// Non-MVP: import CollectorSubscriptionPage from './pages/collector/CollectorSubscriptionPage';

// Non-MVP: Admin pages
// Non-MVP: import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// Non-MVP: import AdminUsersPage from './pages/admin/AdminUsersPage';
// Non-MVP: import AdminReportsPage from './pages/admin/AdminReportsPage';
// Non-MVP: import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
// Non-MVP: import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
// Non-MVP: import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminZonesPage from './pages/admin/AdminZonesPage';
// Non-MVP: import AdminCentersPage from './pages/admin/AdminCentersPage';
// Non-MVP: import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
// Non-MVP: import AdminBillingPage from './pages/admin/AdminBillingPage';
// Non-MVP: import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
// Non-MVP: import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage';
// Non-MVP: import AdminRevenuePage from './pages/admin/AdminRevenuePage';
// Non-MVP: import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
// Non-MVP: import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
// Non-MVP: import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
// Non-MVP: import AdminRevenueSettingsPage from './pages/admin/AdminRevenueSettingsPage';
// Non-MVP: import AdminRecyclingPartnersPage from './pages/admin/AdminRecyclingPartnersPage';

// Revenue / booking routes
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import TransactionsPage from './pages/TransactionsPage';
// Non-MVP: import BusinessPage from './pages/business/BusinessPage';
// Non-MVP: import BusinessPlansPage from './pages/business/BusinessPlansPage';
// Non-MVP: import BusinessDashboardPage from './pages/business/BusinessDashboardPage';

import AIChatWidget from './components/common/AIChatWidget';

import './styles.css';

function AppRoutes() {
  return (
    <Routes>
      {/* ── Landing ────────────────────────────────────── */}
      <Route path="/" element={<LandingOrRedirect />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── Public Auth ───────────────────────────────── */}
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
      <Route path="/map" element={
        <ProtectedRoute>
          <AppLayout><MapPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Non-MVP resident, collector, and admin routes are intentionally disabled for the MVP. */}

      {/* ── Resident booking and payments ─────────────── */}
      <Route path="/book-collection" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><BookingPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><PaymentPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment-success" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><PaymentSuccessPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment-failed" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><PaymentFailedPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><TransactionsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/zones" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminZonesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><BillingPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Non-MVP business and quiz routes are intentionally disabled for the MVP. */}

      <Route path="/waste-log" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><WasteLogPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* ── Smart root redirect ────────────────────────── */}
      <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

// If user is already logged in, redirect to their dashboard. Otherwise show landing page.
function LandingOrRedirect() {
  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  if (token && user) {
    // All authenticated users go to dashboard (admin/collector roles redirect from MVP perspective)
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}

function AIChatWidgetWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <AIChatWidget />;
}

function GlobalBackground() {
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);
  return isAuthPage ? null : <AnimatedBackground />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalBackground />
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
          {/* AI Chat Widget — shows on all authenticated pages */}
          <AIChatWidgetWrapper />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
