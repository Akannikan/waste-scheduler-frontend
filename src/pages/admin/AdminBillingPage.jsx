import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdReceipt, MdCheckCircle, MdSearch, MdAdd,
  MdClose, MdPriceChange, MdFilterList,
} from 'react-icons/md';
import client from '../../api/client';
import { getUsers, getZones, getCategories } from '../../api';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-orange',
  paid: 'badge-green',
  overdue: 'badge-red',
  waived: 'badge-grey',
};

// ── Generate Bill Modal ───────────────────────────────────────
function GenerateBillModal({ onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { billingType: 'monthly_flat', month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  });

  const billingType = watch('billingType');

  useEffect(() => {
    getUsers({ role: 'resident', limit: 100 }).then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await client.post('/billing/generate-bill', {
        userId: Number(data.userId),
        month: Number(data.month),
        year: Number(data.year),
        billingType: data.billingType,
        amountNaira: Number(data.amountNaira),
        totalKg: data.totalKg ? Number(data.totalKg) : undefined,
        notes: data.notes,
      });
      toast.success('Bill generated and email sent!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Generate Bill</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Resident *</label>
            <select className={`form-control ${errors.userId ? 'error' : ''}`} {...register('userId', { required: 'Select a resident' })}>
              <option value="">Select resident...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select>
            {errors.userId && <p className="form-error">{errors.userId.message}</p>}
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month *</label>
              <select className="form-control" {...register('month', { required: true })}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('en-NG', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year *</label>
              <select className="form-control" {...register('year', { required: true })}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Billing Type *</label>
            <select className="form-control" {...register('billingType', { required: true })}>
              <option value="monthly_flat">Monthly Flat Rate</option>
              <option value="per_kg">Per Kilogram</option>
              <option value="per_bin">Per Bin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₦) *</label>
            <input
              type="number"
              className={`form-control ${errors.amountNaira ? 'error' : ''}`}
              placeholder={billingType === 'monthly_flat' ? '2000' : billingType === 'per_kg' ? '1500' : '500'}
              {...register('amountNaira', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' } })}
            />
            {errors.amountNaira && <p className="form-error">{errors.amountNaira.message}</p>}
          </div>

          {billingType === 'per_kg' && (
            <div className="form-group">
              <label className="form-label">Total Weight (kg)</label>
              <input type="number" step="0.1" className="form-control" placeholder="e.g. 30" {...register('totalKg')} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control" rows={2} {...register('notes')} />
          </div>

          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating...' : 'Generate & Send Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Pricing Rules Modal ───────────────────────────────────────
function PricingModal({ onClose, onSuccess }) {
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { billingType: 'monthly_flat', pricePerKg: 50, monthlyFlat: 2000, pricePerBin: 500 },
  });
  const billingType = watch('billingType');

  useEffect(() => {
    Promise.all([getZones(), getCategories()])
      .then(([z, c]) => { setZones(z.data.zones || []); setCategories(c.data.categories || []); })
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await client.post('/billing/pricing-rules', {
        zoneId: data.zoneId ? Number(data.zoneId) : undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        billingType: data.billingType,
        pricePerKg: Number(data.pricePerKg),
        monthlyFlat: Number(data.monthlyFlat),
        pricePerBin: Number(data.pricePerBin),
      });
      toast.success('Pricing rule created!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Pricing Rule</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><MdClose /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Zone (optional)</label>
              <select className="form-control" {...register('zoneId')}>
                <option value="">All Zones (default)</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category (optional)</label>
              <select className="form-control" {...register('categoryId')}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Billing Type</label>
            <select className="form-control" {...register('billingType')}>
              <option value="monthly_flat">Monthly Flat Rate</option>
              <option value="per_kg">Per Kilogram</option>
              <option value="per_bin">Per Bin</option>
            </select>
          </div>

          <div className="grid-3 mt-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">₦ / kg</label>
              <input type="number" className="form-control" {...register('pricePerKg')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Monthly (₦)</label>
              <input type="number" className="form-control" {...register('monthlyFlat')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">₦ / bin</label>
              <input type="number" className="form-control" {...register('pricePerBin')} />
            </div>
          </div>

          <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Rule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminBillingPage() {
  const [tab, setTab] = useState('bills');
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, p, r] = await Promise.all([
        client.get('/billing/all', { params: { page, limit: 20, status: statusFilter || undefined } }),
        client.get('/billing/payments'),
        client.get('/billing/pricing-rules'),
      ]);
      setBills(b.data.bills || []);
      setPagination(b.data.pagination || {});
      setPayments(p.data.payments || []);
      setRules(r.data.rules || []);
    } catch { toast.error('Failed to load billing data'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmPayment = async (id) => {
    setConfirming(id);
    try {
      await client.put(`/billing/confirm-payment/${id}`);
      toast.success('Payment confirmed! Email sent to resident.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    } finally { setConfirming(null); }
  };

  const monthName = (m, y) => new Date(y, m - 1).toLocaleString('en-NG', { month: 'short', year: 'numeric' });

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amountNaira, 0);
  const totalOutstanding = bills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((s, b) => s + b.amountNaira, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing Management</h1>
          <p className="page-subtitle">Manage waste fee bills, confirm payments, and set pricing rules.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setShowPricingModal(true)}>
            <MdPriceChange /> Pricing Rules
          </button>
          <button className="btn btn-primary" onClick={() => setShowBillModal(true)}>
            <MdAdd /> Generate Bill
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)', fontSize: 20, fontWeight: 700 }}>₦</div>
          <div className="stat-info">
            <div className="stat-value">₦{totalCollected.toLocaleString('en-NG')}</div>
            <div className="stat-label">Total Collected</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)', fontSize: 20, fontWeight: 700 }}>₦</div>
          <div className="stat-info">
            <div className="stat-value">₦{totalOutstanding.toLocaleString('en-NG')}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}><MdReceipt size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{pendingPayments.length}</div>
            <div className="stat-label">Pending Confirmations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}><MdPriceChange size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rules.length}</div>
            <div className="stat-label">Pricing Rules</div>
          </div>
        </div>
      </div>

      {/* Pending payment confirmations alert */}
      {pendingPayments.length > 0 && (
        <div className="alert alert-warning mb-4">
          ⚠️ <strong>{pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''}</strong> awaiting confirmation — review in the Payments tab below.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[['bills', `Bills (${pagination.total || 0})`], ['payments', `Payments (${payments.length})`], ['rules', `Pricing Rules (${rules.length})`]].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── BILLS TAB ─────────────────────────────────── */}
      {tab === 'bills' && (
        <>
          <div className="card mb-3" style={{ padding: '12px 16px' }}>
            <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
              <select className="form-control" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>

          {loading ? <SkeletonTable rows={8} /> : bills.length === 0 ? (
            <div className="card"><EmptyState icon={<MdReceipt />} title="No bills found" /></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Resident</th><th>Period</th><th>Type</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Payments</th></tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <tr key={bill.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{bill.user?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{bill.user?.email}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{monthName(bill.month, bill.year)}</td>
                        <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{bill.billingType.replace('_', ' ')}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₦{bill.amountNaira.toLocaleString('en-NG')}</td>
                        <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                          {new Date(bill.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td><span className={`badge ${STATUS_COLORS[bill.status] || 'badge-grey'}`}>{bill.status}</span></td>
                        <td style={{ fontSize: 13 }}>{bill.payments?.length || 0} payment{bill.payments?.length !== 1 ? 's' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{pagination.total} total bills</span>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    <button className="btn btn-ghost btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── PAYMENTS TAB ──────────────────────────────── */}
      {tab === 'payments' && (
        payments.length === 0 ? (
          <div className="card"><EmptyState icon={<MdCheckCircle />} title="No payments yet" /></div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Resident</th><th>Amount</th><th>Reference</th><th>Date</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ background: p.status === 'pending' ? 'rgba(255,152,0,0.04)' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.user?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.user?.email}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₦{p.amountNaira.toLocaleString('en-NG')}</td>
                      <td style={{ fontSize: 13 }}>{p.transferRef || '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td><span className={`badge ${STATUS_COLORS[p.status] || 'badge-grey'}`}>{p.status}</span></td>
                      <td>
                        {p.status === 'pending' && (
                          <button className="btn btn-primary btn-sm" disabled={confirming === p.id} onClick={() => confirmPayment(p.id)}>
                            <MdCheckCircle size={14} /> {confirming === p.id ? 'Confirming...' : 'Confirm'}
                          </button>
                        )}
                        {p.status === 'paid' && <span style={{ color: 'var(--color-primary)', fontSize: 13 }}>✅ Confirmed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── PRICING RULES TAB ─────────────────────────── */}
      {tab === 'rules' && (
        rules.length === 0 ? (
          <div className="card"><EmptyState icon={<MdPriceChange />} title="No pricing rules" action={<button className="btn btn-primary" onClick={() => setShowPricingModal(true)}><MdAdd /> Add Rule</button>} /></div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Zone</th><th>Category</th><th>Type</th><th>₦/kg</th><th>Monthly (₦)</th><th>₦/Bin</th></tr>
                </thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r.id}>
                      <td>{r.zone?.name || <span style={{ color: 'var(--color-text-muted)' }}>All Zones</span>}</td>
                      <td>{r.category?.name || <span style={{ color: 'var(--color-text-muted)' }}>All Categories</span>}</td>
                      <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{r.billingType.replace('_', ' ')}</span></td>
                      <td style={{ fontWeight: 600 }}>₦{r.pricePerKg}</td>
                      <td style={{ fontWeight: 600 }}>₦{r.monthlyFlat?.toLocaleString('en-NG')}</td>
                      <td style={{ fontWeight: 600 }}>₦{r.pricePerBin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {showBillModal && <GenerateBillModal onClose={() => setShowBillModal(false)} onSuccess={() => { setShowBillModal(false); fetchData(); }} />}
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} onSuccess={() => { setShowPricingModal(false); fetchData(); }} />}
    </div>
  );
}
