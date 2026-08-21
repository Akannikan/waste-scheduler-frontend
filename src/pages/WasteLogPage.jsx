import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdAdd, MdClose, MdDelete, MdEco, MdBarChart } from 'react-icons/md';
import { FaLeaf, FaRecycle } from 'react-icons/fa';
import { getCategories } from '../api';
import client from '../api/client';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { getWasteBin } from '../utils/wasteBins';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WasteLogPage() {
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const selectedCategoryId = watch('categoryId');
  const quantityValue = watch('quantityKg');

  const quickWeights = {
    plastic: [1.5, 3, 5],
    paper: [2, 4, 7],
    cardboard: [3, 6, 10],
    glass: [1, 3, 5],
    metal: [1, 2, 4],
    organic: [2, 5, 8],
    'food-waste': [2, 5, 8],
    'garden-waste': [3, 6, 10],
    'e-waste': [0.5, 1.5, 3],
    hazardous: [0.5, 1, 2],
    residual: [2, 4, 6],
    general: [2, 4, 6],
  };

  const fetchLogs = async () => {
    try {
      const res = await client.get('/waste-logs/my');
      setLogs(res.data.logs || []);
    } catch { }
  };

  const fetchEstimate = async () => {
    const now = new Date();
    try {
      const res = await client.post('/billing/calculate-by-weight', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setEstimate(res.data);
    } catch { }
  };

  useEffect(() => {
    Promise.all([
      getCategories().then(r => setCategories(r.data.categories || [])),
      fetchLogs(),
      fetchEstimate(),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const category = categories.find(c => String(c.id) === String(selectedCategoryId));
    if (!category?.slug) return;

    const weights = quickWeights[category.slug] || [2, 5, 8];
    const defaultWeight = weights[0];
    const current = Number(quantityValue || 0);

    if (!current || (!Number.isFinite(current) && current <= 0)) {
      setValue('quantityKg', defaultWeight, { shouldValidate: true });
    }
  }, [selectedCategoryId, categories, quantityValue, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await client.post('/waste-logs', {
        categoryId: Number(data.categoryId),
        quantityKg: Number(data.quantityKg),
        notes: data.notes,
      });
      toast.success('Waste log added!');
      reset();
      setShowModal(false);
      await Promise.all([fetchLogs(), fetchEstimate()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add log');
    } finally { setSubmitting(false); }
  };

  const deleteLog = async (id) => {
    try {
      await client.delete(`/waste-logs/${id}`);
      setLogs(l => l.filter(x => x.id !== id));
      fetchEstimate();
      toast.success('Log deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const uniqueCategories = categories.filter((category, index, items) => (
    items.findIndex(item => item.slug === category.slug) === index
  ));

  // Chart data
  const byCategory = uniqueCategories.map(cat => ({
    name: cat.name,
    color: cat.color,
    total: logs.filter(l => l.categoryId === cat.id).reduce((s, l) => s + l.quantityKg, 0),
  })).filter(c => c.total > 0);

  const doughnutData = {
    labels: byCategory.map(c => c.name),
    datasets: [{ data: byCategory.map(c => c.total), backgroundColor: byCategory.map(c => c.color), borderWidth: 0 }],
  };

  // Last 7 days bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' });
    const total = logs.filter(l => new Date(l.loggedAt).toDateString() === d.toDateString())
      .reduce((s, l) => s + l.quantityKg, 0);
    return { label, total };
  });

  const barData = {
    labels: last7.map(d => d.label),
    datasets: [{ label: 'kg logged', data: last7.map(d => d.total), backgroundColor: 'rgba(46,125,50,0.75)', borderRadius: 6 }],
  };

  const totalThisMonth = logs.filter(l => {
    const d = new Date(l.loggedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, l) => s + l.quantityKg, 0);

  const getCategoryById = id => uniqueCategories.find(c => c.id === id);

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Waste Log</h1>
          <p className="page-subtitle">Track your daily waste generation and see your environmental impact.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Log Waste
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}><FaLeaf size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{totalThisMonth.toFixed(1)} kg</div>
            <div className="stat-label">Logged This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdBarChart size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Total Log Entries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><FaRecycle size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{byCategory.length}</div>
            <div className="stat-label">Waste Categories</div>
          </div>
        </div>
        {estimate && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)', fontSize: 18, fontWeight: 700 }}>₦</div>
            <div className="stat-info">
              <div className="stat-value">₦{estimate.estimatedAmount.toLocaleString('en-NG')}</div>
              <div className="stat-label">Est. Fee by Weight</div>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {logs.length > 0 && (
        <div className="grid-2 mb-6">
          <div className="card">
            <h3 className="card-title mb-4">Waste by Category</h3>
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '60%' }} />
            </div>
          </div>
          <div className="card">
            <h3 className="card-title mb-4">Last 7 Days (kg)</h3>
            <div style={{ height: 220 }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }} />
            </div>
          </div>
        </div>
      )}

      {/* Environmental impact tip */}
      {totalThisMonth > 0 && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg,rgba(46,125,50,0.08),rgba(25,118,210,0.05))', borderLeft: '4px solid var(--color-primary)' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 32 }}>🌍</span>
            <div>
              <h4 style={{ margin: 0, marginBottom: 4 }}>Your Environmental Impact This Month</h4>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                You've logged <strong>{totalThisMonth.toFixed(1)} kg</strong> of waste this month.
                That's equivalent to approximately <strong>{(totalThisMonth * 0.9).toFixed(1)} kg of CO₂</strong> that could have gone to landfill.
                Keep logging and recycling! 🌿
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logs table */}
      {logs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdEco />}
            title="No waste logs yet"
            message="Start tracking your daily waste to see charts, trends, and your environmental impact."
            action={<button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> Log Your First Entry</button>}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="card-title">Waste History</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Category</th><th>Weight (kg)</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const cat = getCategoryById(log.categoryId);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{formatDate(log.loggedAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat?.color || '#ccc', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{cat?.name || 'Unknown'}</span>
                          <span className="waste-destination-label">{getWasteBin(cat).name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>{log.quantityKg} kg</span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 200 }}>
                        {log.notes || '—'}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => deleteLog(log.id)} title="Delete">
                          <MdDelete size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Waste Entry</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Waste Category *</label>
                <select className={`form-control ${errors.categoryId ? 'error' : ''}`} {...register('categoryId', { required: 'Select a category' })}>
                  <option value="">Select category...</option>
                  {uniqueCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {getWasteBin(c).name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className={`form-control ${errors.quantityKg ? 'error' : ''}`}
                  placeholder="e.g. 2.5"
                  value={quantityValue ?? ''}
                  onChange={(e) => setValue('quantityKg', e.target.value, { shouldValidate: true })}
                />
                {selectedCategoryId && (() => {
                  const category = categories.find(c => String(c.id) === String(selectedCategoryId));
                  const weights = quickWeights[category?.slug] || [2, 5, 8];
                  return (
                    <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                      {weights.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setValue('quantityKg', Number(amount), { shouldValidate: true })}
                        >
                          {Number(amount).toFixed(1)} kg
                        </button>
                      ))}
                    </div>
                  );
                })()}
                {errors.quantityKg && <p className="form-error">{errors.quantityKg.message}</p>}
                <p className="form-hint">Estimate if you don't have a scale — a full black bag is about 5–8 kg</p>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows={3} placeholder="e.g. Kitchen waste from this week, old newspapers..." {...register('notes')} />
              </div>

              {/* Category tips */}
              <div className="grid-2 mb-4" style={{ gap: 8 }}>
                {uniqueCategories.slice(0, 4).map(cat => (
                  <div key={cat.id} style={{ background: `${cat.color}10`, borderRadius: 8, padding: '8px 12px', borderLeft: `3px solid ${cat.color}`, fontSize: 12 }}>
                    <strong style={{ color: cat.color }}>{cat.name}</strong>
                    <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>Destination: {getWasteBin(cat).name}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <MdAdd /> {submitting ? 'Saving...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
