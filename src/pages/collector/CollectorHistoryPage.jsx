import { useEffect, useState } from 'react';
import { MdHistory, MdCheckCircle, MdScale, MdCalendarToday } from 'react-icons/md';
import client from '../../api/client';
import { PageLoading } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export default function CollectorHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    client.get('/collection-records/my', { params: { page, limit: LIMIT } })
      .then(res => setRecords(res.data.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalKg = records.reduce((s, r) => s + (r.quantityKg || 0), 0);
  const today = records.filter(r => new Date(r.completedAt).toDateString() === new Date().toDateString());
  const thisMonth = records.filter(r => {
    const d = new Date(r.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collection History</h1>
          <p className="page-subtitle">All your completed waste collection records.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdCheckCircle size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{records.length}</div>
            <div className="stat-label">Total Collections</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdScale size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{totalKg.toLocaleString('en-NG', { maximumFractionDigits: 1 })} kg</div>
            <div className="stat-label">Total Waste Collected</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdCalendarToday size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{today.length}</div>
            <div className="stat-label">Today's Pickups</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><MdHistory size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{thisMonth.length}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdHistory />}
            title="No collections yet"
            message="Your completed collection records will appear here after you mark pickups as complete."
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Zone</th>
                  <th>Category</th>
                  <th>Weight Collected</th>
                  <th>Completed At</th>
                  <th>Truck</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>#{r.scheduleId}</td>
                    <td style={{ fontSize: 13 }}>{r.schedule?.zone?.name || '—'}</td>
                    <td>
                      {r.schedule?.category ? (
                        <div className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.schedule.category.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 14 }}>{r.schedule.category.name}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {r.quantityKg ? (
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{r.quantityKg} kg</span>
                      ) : <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Not recorded</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(r.completedAt)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatTime(r.completedAt)}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.truck?.plateNumber || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 180 }}>
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length >= LIMIT && (
            <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Showing {records.length} records</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
