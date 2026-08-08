import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getSchedulesByMonth, getWasteByCategory, getUserRegistrations } from '../../api';
import { PageLoading } from '../../components/common/LoadingSkeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};

const BAR_OPTIONS = {
  ...CHART_OPTIONS,
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
};

export default function AdminAnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthly, setMonthly] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [regData, setRegData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSchedulesByMonth(year),
      getWasteByCategory(),
      getUserRegistrations(year),
    ]).then(([m, w, r]) => {
      setMonthly(m.data.monthly || []);
      setWasteData(w.data.data || []);
      setRegData(r.data.monthly || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [year]);

  const collectionBarData = {
    labels: monthly.map(m => m.label),
    datasets: [
      { label: 'Completed', data: monthly.map(m => m.completed), backgroundColor: 'rgba(46,125,50,0.8)', borderRadius: 4 },
      { label: 'Missed', data: monthly.map(m => m.missed), backgroundColor: 'rgba(211,47,47,0.8)', borderRadius: 4 },
    ],
  };

  const wasteDoughnutData = {
    labels: wasteData.map(w => w.name),
    datasets: [{
      data: wasteData.map(w => w.totalKg),
      backgroundColor: wasteData.map(w => w.color),
      borderWidth: 0,
    }],
  };

  const regLineData = {
    labels: regData.map(r => r.label),
    datasets: [{
      label: 'New Registrations',
      data: regData.map(r => r.count),
      borderColor: 'var(--color-secondary)',
      backgroundColor: 'rgba(25,118,210,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">System-wide performance data and environmental metrics.</p>
        </div>
        <select className="form-control" style={{ width: 120 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid-2">
        {/* Collection bar chart */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Monthly Collections ({year})</h3>
          <div style={{ height: 260 }}>
            <Bar data={collectionBarData} options={BAR_OPTIONS} />
          </div>
        </div>

        {/* Waste by category */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Waste by Category (kg)</h3>
          {wasteData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              No waste log data yet.
            </div>
          ) : (
            <div style={{ height: 260 }}>
              <Doughnut data={wasteDoughnutData} options={{ ...CHART_OPTIONS, cutout: '60%' }} />
            </div>
          )}
        </div>

        {/* User registrations line chart */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>User Registrations ({year})</h3>
          <div style={{ height: 240 }}>
            <Line data={regLineData} options={{ ...BAR_OPTIONS }} />
          </div>
        </div>

        {/* Summary table */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Collection Summary ({year})</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Month</th><th>Total</th><th>Completed</th><th>Missed</th><th>Rate</th></tr></thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{m.label}</td>
                    <td>{m.scheduled}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{m.completed}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{m.missed}</td>
                    <td>
                      {m.scheduled > 0 ? (
                        <span style={{ fontWeight: 600, color: m.completed / m.scheduled >= 0.8 ? 'var(--color-primary)' : 'var(--color-warning)' }}>
                          {Math.round((m.completed / m.scheduled) * 100)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
