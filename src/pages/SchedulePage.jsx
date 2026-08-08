import { useEffect, useState } from 'react';
import { MdSchedule, MdFilterList, MdSearch } from 'react-icons/md';
import { getSchedules, getCategories, getZones } from '../api';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ categoryId: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    Promise.all([getCategories(), getZones()])
      .then(([c, z]) => {
        setCategories(c.data.categories || []);
        setZones(z.data.zones || []);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.status) params.status = filters.status;
        const res = await getSchedules(params);
        setSchedules(res.data.schedules || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [page, filters]);

  const filtered = filters.search
    ? schedules.filter((s) =>
        s.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.zone?.name?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : schedules;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collection Schedule</h1>
          <p className="page-subtitle">View all upcoming waste pickup schedules in your area.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: '1 1 220px' }}>
            <span className="input-icon"><MdSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search schedules..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>

          <select
            className="form-control"
            style={{ flex: '0 1 180px' }}
            value={filters.categoryId}
            onChange={(e) => { setFilters((f) => ({ ...f, categoryId: e.target.value })); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            className="form-control"
            style={{ flex: '0 1 160px' }}
            value={filters.status}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdSchedule />}
            title="No schedules found"
            message="No collection schedules match your filters. Try adjusting your search."
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Zone</th>
                  <th>Pickup Date</th>
                  <th>Time</th>
                  <th>Recurrence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.category?.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.category?.name || s.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.category?.binColor}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.zone?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.zone?.code}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{formatDate(s.pickupDate)}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{formatTime(s.pickupDate)}</td>
                    <td>
                      {s.recurrence ? (
                        <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s.recurrence}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>One-time</span>
                      )}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
