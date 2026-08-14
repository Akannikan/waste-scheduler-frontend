import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        updateUser(user);
        toast.success(`Welcome, ${user.name}! 🎉`);
        const dest = user.role === 'admin' ? '/admin/dashboard' : user.role === 'collector' ? '/collector/dashboard' : '/dashboard';
        navigate(dest, { replace: true });
      } catch {
        toast.error('Authentication error. Please try again.');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1B5E20,#1565C0)' }}>
      <PageLoading />
      <p style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>Completing Google Sign-In...</p>
    </div>
  );
}
