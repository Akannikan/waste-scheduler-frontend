import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRoute, MdCheckCircle, MdPending, MdSchedule } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { getSchedules } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonStatGrid } from '../../components/common/LoadingSkeleton';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CollectorDashboardPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedules({ limit: 30 })
      .then((res) => setSchedules(res.data.schedules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = schedules.filter((s) => {
    const d = new Date(s.pickupDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const upcoming = schedules.filter((s) => new Date(s.pickupDate) > new Date() && s.status === 'scheduled');
  const completed = schedules.filter((s) => s.status === 'completed');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collector Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]}. Here's your schedule for today.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonStatGrid />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdSchedule size={22} /></div>
              <div className="stat-info"><div className="stat-value">{today.length}</div><div className="stat-label">Today's Pickups</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdPending size={22} /></div>
              <div className="stat-info"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
              <div className="stat-info"><div className="stat-value">{completed.length}</div><div className="stat-label">Completed</div></div>
            </div>
          </div>

          {/* Today's tasks */}
          <div className="card mt-4">
            <div className="card-header">
              <h3 className="card-title">Today's Collection Tasks</h3>
              <Link to="/collector/pickups" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {today.length === 0 ? (
              <p className="text-muted text-sm" style={{ padding: '20px 0' }}>No pickups assigned for today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {today.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.category?.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.zone?.name} • {s.category?.binColor}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
