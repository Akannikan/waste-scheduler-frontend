import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdReceipt, MdUpload, MdCheckCircle, MdClose, MdInfo, MdAccountBalance, MdPrint } from 'react-icons/md';
import client from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const statusBadge = {
  pending: { cls: 'badge-orange', label: 'Pending' },
  paid: { cls: 'badge-green', label: 'Paid' },
  overdue: { cls: 'badge-red', label: 'Overdue' },
  waived: { cls: 'badge-grey', label: 'Waived' },
};

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const bankInfo = {
    name: 'First Bank Nigeria',
    account: '3012345678',
    accountName: 'WasteScheduler Nigeria Ltd',
  };

  useEffect(() => {
    client.get('/billing/my-bills')
      .then(res => { setBills(res.data.bills || []); setSummary(res.data.summary || {}); })
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Calculate estimate for current month
    const now = new Date();
    client.post('/billing/calculate-by-weight', { month: now.getMonth() + 1, year: now.getFullYear() })
      .then(res => setEstimate(res.data))
      .catch(() => {});
  }, []);

  const amountValue = watch('amount');
  const suggestedAmounts = selectedBill
    ? [selectedBill.amountNaira, Math.max(selectedBill.amountNaira - 500, 500), selectedBill.amountNaira + 1000]
    : [Number(summary.totalOwed || 0), Number(summary.totalPaid || 0) || 0, estimate ? Math.round(estimate.estimatedAmount) : 0].filter(Boolean);

  useEffect(() => {
    if (!showPayModal) return;

    const defaultAmount = selectedBill ? selectedBill.amountNaira : Number(summary.totalOwed || 0) || 0;
    setValue('amount', defaultAmount || '', { shouldValidate: true });
    setValue('transferRef', '', { shouldValidate: false });
  }, [showPayModal, selectedBill, summary.totalOwed, setValue]);

  const onPaySubmit = async (data) => {
    setSubmitting(true);
    try {
      await client.post('/billing/submit-payment', {
        billId: selectedBill?.id,
        amountNaira: Number(data.amount),
        bankName: bankInfo.name,
        transferRef: data.transferRef,
        proofImageUrl: data.proofImageUrl || undefined,
        notes: data.notes,
      });
      toast.success('Payment submitted! Confirmation within 24 hours.');
      setShowPayModal(false);
      reset();
      // Refresh bills
      const res = await client.get('/billing/my-bills');
      setBills(res.data.bills || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const monthName = (m, y) => new Date(y, m - 1).toLocaleString('en-NG', { month: 'long', year: 'numeric' });

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle">Manage your waste fee payments in Nigerian Naira (₦)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedBill(null); setShowPayModal(true); }}>
          <MdAccountBalance /> Make Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)' }}>₦</div>
          <div className="stat-info">
            <div className="stat-value">₦{(summary.totalOwed || 0).toLocaleString('en-NG')}</div>
            <div className="stat-label">Amount Owed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-primary)' }}>₦</div>
          <div className="stat-info">
            <div className="stat-value">₦{(summary.totalPaid || 0).toLocaleString('en-NG')}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
        {estimate && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-accent)' }}>⚖️</div>
            <div className="stat-info">
              <div className="stat-value">{estimate.totalKg.toFixed(1)} kg</div>
              <div className="stat-label">Waste this month</div>
            </div>
          </div>
        )}
        {estimate && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(25,118,210,0.12)', color: 'var(--color-secondary)' }}>📊</div>
            <div className="stat-info">
              <div className="stat-value">₦{estimate.estimatedAmount.toLocaleString('en-NG')}</div>
              <div className="stat-label">Estimated (by weight)</div>
            </div>
          </div>
        )}
      </div>

      {/* Bank details card */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--color-primary)', background: 'linear-gradient(135deg, rgba(46,125,50,0.05), rgba(25,118,210,0.05))' }}>
        <h3 className="card-title mb-3"><MdAccountBalance style={{ marginRight: 8, verticalAlign: 'middle' }} />Payment Account Details</h3>
        <div className="grid-3" style={{ gap: 16 }}>
          {[
            ['🏦 Bank', bankInfo.name],
            ['💳 Account Number', bankInfo.account],
            ['👤 Account Name', bankInfo.accountName],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'var(--color-surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
          <MdInfo /> After transfer, click <strong>Make Payment</strong> above to submit your proof and reference number.
        </div>
      </div>

      {/* Bills table */}
      {bills.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdReceipt />} title="No bills yet" message="Your monthly waste fee bills will appear here." />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="card-title">Payment History</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Period</th><th>Billing Type</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 600 }}>{monthName(bill.month, bill.year)}</td>
                    <td>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                        {bill.billingType.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₦{bill.amountNaira.toLocaleString('en-NG')}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {new Date(bill.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge[bill.status]?.cls || 'badge-grey'}`}>
                        {statusBadge[bill.status]?.label || bill.status}
                      </span>
                    </td>
                    <td>
                      {bill.status !== 'paid' && (
                        <div className="flex gap-1">
                          <button className="btn btn-primary btn-sm" onClick={() => { setSelectedBill(bill); setShowPayModal(true); }}>
                            Pay ₦{bill.amountNaira.toLocaleString()}
                          </button>
                          <a
                            href={`${import.meta.env.VITE_API_URL || '/api'}/billing/receipt/${bill.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-icon"
                            title="View receipt"
                          >
                            <MdPrint size={16} />
                          </a>
                        </div>
                      )}
                      {bill.status === 'paid' && (
                        <div className="flex gap-1">
                          <span style={{ color: 'var(--color-primary)', fontSize: 13 }}>✅ Paid</span>
                          <a
                            href={`${import.meta.env.VITE_API_URL || '/api'}/billing/receipt/${bill.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-icon"
                            title="Download receipt"
                          >
                            <MdPrint size={16} />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="modal-backdrop" onClick={() => setShowPayModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedBill ? `Pay ₦${selectedBill.amountNaira.toLocaleString('en-NG')}` : 'Submit Payment'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPayModal(false)}><MdClose /></button>
            </div>

            <div className="alert alert-info mb-4">
              <MdInfo /> Transfer to <strong>{bankInfo.account}</strong> ({bankInfo.name}), then fill in your reference below.
            </div>

            <form onSubmit={handleSubmit(onPaySubmit)}>
              <div className="form-group">
                <label className="form-label">Amount Paid (₦) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  placeholder={selectedBill ? selectedBill.amountNaira : '2000'}
                  value={amountValue ?? ''}
                  onChange={(e) => setValue('amount', e.target.value, { shouldValidate: true })}
                />
                <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                  {[...new Set(suggestedAmounts)].slice(0, 3).map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setValue('amount', Number(amount), { shouldValidate: true })}
                    >
                      ₦{Number(amount).toLocaleString('en-NG')}
                    </button>
                  ))}
                </div>
                {errors.amount && <p className="form-error">{errors.amount.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Reference / Receipt Number *</label>
                <input
                  type="text"
                  className={`form-control ${errors.transferRef ? 'error' : ''}`}
                  placeholder="e.g. FBN2024082512345"
                  {...register('transferRef', { required: 'Transfer reference is required' })}
                />
                <p className="form-hint">Tip: start with your bank name initials, date, and a unique 5–8 digit reference.</p>
                {errors.transferRef && <p className="form-error">{errors.transferRef.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Proof of Payment URL (optional)</label>
                <input type="url" className="form-control" placeholder="https://..." {...register('proofImageUrl')} />
                <p className="form-hint">Paste a link to your screenshot or upload to a cloud service first</p>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-control" rows={2} placeholder="Any additional info..." {...register('notes')} />
              </div>

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <MdCheckCircle /> {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
