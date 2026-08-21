import { useEffect, useState } from 'react';
import { getRevenueSummary } from '../../api';
import { formatNaira } from '../../utils/currency';

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    collectorEarnings: 0,
    pendingPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refunds: 0,
    subscriptions: 0,
    businessRevenue: 0,
    withdrawals: 0,
    netPlatformRevenue: 0,
  });

  useEffect(() => {
    getRevenueSummary().then((res) => setSummary(res.data.summary || summary)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin revenue dashboard</h1>
          <p className="page-subtitle">Overview of platform income, collector payouts, and all monetization activity.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(31,175,116,0.12)', color: 'var(--color-primary)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.totalRevenue)}</div><div className="stat-label">Total Revenue</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(29,78,216,0.12)', color: 'var(--color-secondary)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.platformCommission)}</div><div className="stat-label">Platform Commission</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--color-accent)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.collectorEarnings)}</div><div className="stat-label">Collector Earnings</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(126,87,194,0.12)', color: '#7E57C2' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.pendingPayments)}</div><div className="stat-label">Pending Payments</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-success)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.successfulPayments)}</div><div className="stat-label">Successful Payments</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.failedPayments)}</div><div className="stat-label">Failed Payments</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(2,136,209,0.12)', color: 'var(--color-info)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.refunds)}</div><div className="stat-label">Refunds</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(29,78,216,0.12)', color: 'var(--color-secondary)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.subscriptions)}</div><div className="stat-label">Subscriptions</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.businessRevenue)}</div><div className="stat-label">Business Revenue</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(255,152,0,0.12)', color: 'var(--color-warning)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.netPlatformRevenue)}</div><div className="stat-label">Net Platform Revenue</div></div></div>
      </div>
    </div>
  );
}
