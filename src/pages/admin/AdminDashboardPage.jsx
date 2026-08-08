import { useEffect, useState } from 'react';
import { MdPeople, MdSchedule, MdReport, MdRecycling, MdCheckCircle, MdWarning } from 'react-icons/md';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getDashboardStats, getSchedulesByMonth, getReportsByStatus } from '../../api';
import { SkeletonStatGrid, SkeletonCard } from '../../components/common/LoadingSkeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [reportStats, setReportStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getSchedulesByMonth(new Date().getFullYear()),
      getReportsByStatus(),
    ]).then(([s, m, r]) => {
      setStats(s.data.stats);
      setMonthly(m.data.monthly || []);
      setReportStats(r.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const barData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      { label: 'Scheduled', data: monthly.map((m) => m.scheduled), backgroundColor: 'rgba(25,118,210,0.8)', borderRadius: 4 },
      { label: 'Completed', data: monthly.map((m) => m.completed), backgroundColor: 'rgba(46,125,50,0.8)', borderRadius: 4 },
      { label: 'Missed', data: monthly.map((m) => m.missed), backgroundColor: 'rgba(211,47,47,0.8)', borderRadius: 4 },
    ],
  };

  const statusColors = { pending: '#FF9800', under_review: '#1976D2', resolved: '#2E7D32', rejected: '#D32F2F' };
  const doughnutData = {
    labels: reportStats.map((r) => r.status.replace('_', ' ')),
    datasets: [{
      data: reportStats.map((r) => r.count),
      backgroundColor: reportStats.map((r) => statusColors[r.status] || '#ccc'),
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and performance metrics.</p>
        </div>
      </div>

      {loading ? (
        <>
          <SkeletonStatGrid />
          <div className="grid-2"><SkeletonCard /><SkeletonCard /></div>
        </>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdPeople size={22} /></div>
              <div className="stat-info"><div className="stat-value">{stats?.totalUsers || 0}</div><div className="stat-label">Active Users</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
              <div className="stat-info"><div className="stat-value">{stats?.completedSchedules || 0}</div><div className="stat-label">Completed Pickups</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)' }}><MdWarning size={22} /></div>
              <div className="stat-info"><div className="stat-value">{stats?.pendingReports || 0}</div><div className="stat-label">Pending Reports</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdRecycling size={22} /></div>
              <div className="stat-info">
                <div className="stat-value">{stats?.collectionRate || 0}%</div>
                <div className="stat-label">Collection Rate</div>
              </div>
            </div>
          </div>

          <div className="grid-2 mt-4">
            {/* Bar chart */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Monthly Collection Overview</h3>
              <div style={{ height: 260 }}>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            {/* Doughnut chart */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Reports by Status</h3>
              {reportStats.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  No report data yet.
                </div>
              ) : (
                <div style={{ height: 260 }}>
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
                </div>
              )}
            </div>
          </div>

          {/* System summary */}
          <div className="card mt-4">
            <h3 className="card-title" style={{ marginBottom: 16 }}>System Summary</h3>
            <div className="grid-4">
              {[
                { label: 'Total Schedules', value: stats?.totalSchedules, color: 'var(--color-secondary)' },
                { label: 'Missed Pickups', value: stats?.missedSchedules, color: 'var(--color-danger)' },
                { label: 'Resolved Reports', value: stats?.resolvedReports, color: 'var(--color-primary)' },
                { label: 'Recycling Centers', value: stats?.totalCenters, color: 'var(--color-accent)' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center', padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{item.value ?? '—'}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
