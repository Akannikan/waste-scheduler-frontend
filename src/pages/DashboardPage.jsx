import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSchedule, MdReport, MdNotifications, MdAnnouncement, MdCalendarToday, MdRecycling, MdDeleteSweep } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getUpcomingSchedules, getAnnouncements, getNotifications, getMyWasteLogs } from '../api';
import { SkeletonStatGrid, SkeletonCard } from '../components/common/LoadingSkeleton';
import StatusBadge from '../components/common/StatusBadge';
import { getWasteBin, summarizeWasteBins } from '../utils/wasteBins';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return 'Past';
  return `In ${days} days`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sched, ann, notif, waste] = await Promise.all([
          getUpcomingSchedules(),
          getAnnouncements({ limit: 3 }),
          getNotifications(),
          getMyWasteLogs(),
        ]);
        setSchedules(sched.data.schedules || []);
        setAnnouncements(ann.data.announcements || []);
        setUnreadCount(notif.data.unreadCount || 0);
        setWasteLogs(waste.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const nextPickup = schedules[0];
  const ecoPoints = user?.points || 0;
  const badgeCount = user?.badges?.length || 0;
  const wasteBins = summarizeWasteBins(wasteLogs);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your waste schedule overview for today.</p>
        </div>
        <Link to="/reports" className="btn btn-primary">
          <MdReport /> Report an Issue
        </Link>
      </div>

      {loading ? (
        <>
          <SkeletonStatGrid />
          <div className="grid-2"><SkeletonCard /><SkeletonCard /></div>
        </>
      ) : (
        <>
          {/* Quick stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}>
                <MdSchedule size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{schedules.length}</div>
                <div className="stat-label">Upcoming Pickups</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}>
                <MdNotifications size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{unreadCount}</div>
                <div className="stat-label">Unread Notifications</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}>
                <FaLeaf size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{ecoPoints}</div>
                <div className="stat-label">Eco Points</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}>
                <FaLeaf size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{user?.zoneId ? 'Active' : 'No Zone'}</div>
                <div className="stat-label">Zone Status</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(2,136,209,0.12)', color: 'var(--color-info)' }}>
                <MdAnnouncement size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{announcements.length}</div>
                <div className="stat-label">Announcements</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}>
                <MdReport size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{badgeCount}</div>
                <div className="stat-label">Badges Earned</div>
              </div>
            </div>
          </div>

          <section className="dashboard-bins-section" aria-labelledby="waste-bins-title">
            <div className="card-header dashboard-bins-header">
              <div>
                <p className="section-kicker">Waste sorting</p>
                <h2 id="waste-bins-title" className="dashboard-bins-title">Your three-bin view</h2>
                <p className="text-muted text-sm">Choose a waste type when logging. Its destination is assigned automatically.</p>
              </div>
              <Link to="/waste-log" className="btn btn-primary btn-sm"><MdRecycling /> Log waste</Link>
            </div>
            <div className="dashboard-bins-grid">
              {wasteBins.map(bin => {
                const Icon = bin.icon === 'organic' ? FaLeaf : bin.icon === 'residual' ? MdDeleteSweep : MdRecycling;
                return (
                  <article key={bin.id} className="waste-bin-card" style={{ '--bin-color': bin.color, '--bin-soft-color': bin.softColor }}>
                    <div className="waste-bin-visual">
                      <div className="waste-bin-lid" />
                      <div className="waste-bin-body"><Icon size={42} /></div>
                    </div>
                    <div className="waste-bin-copy">
                      <div className="waste-bin-name-row">
                        <h3>{bin.name}</h3>
                        <span className="waste-bin-status">Active</span>
                      </div>
                      <p className="waste-bin-category">{bin.category}</p>
                      <p className="waste-bin-description">{bin.description}</p>
                      <div className="waste-bin-total">
                        <strong>{bin.quantityKg.toFixed(1)} kg</strong>
                        <span>{bin.entries} {bin.entries === 1 ? 'entry' : 'entries'}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Next pickup banner */}
          {nextPickup && (
            <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: '#fff', border: 'none' }}>
              <div className="flex items-center gap-4">
                <div style={{ fontSize: 40 }}>🗑️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Next Scheduled Pickup</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{nextPickup.category?.name} Collection</div>
                  <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                    {formatDate(nextPickup.pickupDate)} • {nextPickup.zone?.name} • {getWasteBin(nextPickup.category).name}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>
                  {daysUntil(nextPickup.pickupDate)}
                </div>
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Upcoming schedules */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><MdCalendarToday style={{ marginRight: 8, verticalAlign: 'middle' }} />Upcoming Pickups</h3>
                <Link to="/schedule" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              {schedules.length === 0 ? (
                <p className="text-muted text-sm">No upcoming pickups scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {schedules.slice(0, 5).map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.category?.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.category?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(s.pickupDate)}</div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>{daysUntil(s.pickupDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><MdAnnouncement style={{ marginRight: 8, verticalAlign: 'middle' }} />Announcements</h3>
              </div>
              {announcements.length === 0 ? (
                <p className="text-muted text-sm">No announcements at the moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {announcements.map((a) => (
                    <div key={a.id} style={{ padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{a.message.length > 120 ? a.message.slice(0, 120) + '...' : a.message}</p>
                      <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 6 }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4" style={{ background: 'linear-gradient(135deg, rgba(46,125,50,0.05), rgba(25,118,210,0.04))' }}>
            <div className="card-header" style={{ paddingBottom: 10 }}>
              <h3 className="card-title">Eco Game Progress</h3>
              <Link to="/quiz" className="btn btn-ghost btn-sm">Play now</Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{ecoPoints}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total eco points</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-secondary)' }}>{badgeCount}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Badges unlocked</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card mt-4">
            <h3 className="card-title mb-4">Quick Actions</h3>
            <div className="grid-4" style={{ gap: 12 }}>
              {[
                { to: '/schedule', icon: <MdSchedule size={24} />, label: 'View Schedule', color: '#2E7D32' },
                { to: '/calendar', icon: <MdCalendarToday size={24} />, label: 'Calendar', color: '#1976D2' },
                { to: '/guide', icon: <MdRecycling size={24} />, label: 'Waste Guide', color: '#FF9800' },
                { to: '/reports', icon: <MdReport size={24} />, label: 'Report Issue', color: '#D32F2F' },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: '20px 12px', background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-lg)', textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${action.color}20`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
