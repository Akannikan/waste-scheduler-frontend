import { useEffect, useState } from 'react';
import { getCollectorEarnings } from '../../api';
import { formatNaira } from '../../utils/currency';

export default function CollectorEarningsPage() {
  const [summary, setSummary] = useState({ totalEarnings: 0, pendingEarnings: 0, availableBalance: 0, completedJobs: 0, commissionDeducted: 0, earningsThisMonth: 0, earningsThisYear: 0 });
  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    getCollectorEarnings()
      .then((res) => {
        setSummary(res.data.summary || summary);
        setEarnings(res.data.earnings || []);
      })
      .catch(() => {
        setSummary(summary);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue & Earnings</h1>
          <p className="page-subtitle">Monitor your balances, approved earnings, and completed jobs.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(31,175,116,0.12)', color: 'var(--color-primary)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.totalEarnings)}</div><div className="stat-label">Total earnings</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--color-accent)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.pendingEarnings)}</div><div className="stat-label">Pending earnings</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(29,78,216,0.12)', color: 'var(--color-secondary)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.availableBalance)}</div><div className="stat-label">Available balance</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(126,87,194,0.12)', color: '#7E57C2' }}><span>#</span></div><div className="stat-info"><div className="stat-value">{summary.completedJobs}</div><div className="stat-label">Completed jobs</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(211,47,47,0.12)', color: 'var(--color-danger)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.commissionDeducted)}</div><div className="stat-label">Commission deducted</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--color-success)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.earningsThisMonth)}</div><div className="stat-label">Earnings this month</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(2,136,209,0.12)', color: 'var(--color-info)' }}><span>₦</span></div><div className="stat-info"><div className="stat-value">{formatNaira(summary.earningsThisYear)}</div><div className="stat-label">Earnings this year</div></div></div>
      </div>

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Collection amount</th>
              <th>Platform commission</th>
              <th>Collector earnings</th>
              <th>Payment status</th>
            </tr>
          </thead>
          <tbody>
            {earnings.length === 0 ? (
              <tr><td colSpan="7">No earnings recorded yet.</td></tr>
            ) : earnings.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.createdAt).toLocaleDateString('en-NG')}</td>
                <td>#{item.bookingId || '—'}</td>
                <td>{item.customer?.name || 'Customer'}</td>
                <td>{formatNaira(item.collectionAmount)}</td>
                <td>{formatNaira(item.platformCommission)}</td>
                <td>{formatNaira(item.collectorEarnings)}</td>
                <td><span className={`badge ${item.paymentStatus === 'successful' ? 'badge-green' : item.paymentStatus === 'pending' ? 'badge-orange' : 'badge-grey'}`}>{item.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
