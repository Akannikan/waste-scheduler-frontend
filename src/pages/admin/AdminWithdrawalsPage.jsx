import { useEffect, useState } from 'react';
import { getCollectorWithdrawals } from '../../api';
import { formatNaira } from '../../utils/currency';

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getCollectorWithdrawals().then((res) => setItems(res.data.withdrawals || [])).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawal requests</h1>
          <p className="page-subtitle">Review collector payouts and follow each request through its status.</p>
        </div>
      </div>

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Collector</th>
              <th>Bank</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5">No withdrawal requests yet.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td>{item.collector?.name || 'Unknown collector'}</td>
                <td>{item.bankName || 'Bank transfer'}</td>
                <td>{item.accountNumber || '—'}</td>
                <td>{formatNaira(item.amount)}</td>
                <td><span className={`badge ${item.status === 'successful' ? 'badge-green' : item.status === 'pending' ? 'badge-orange' : 'badge-grey'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
