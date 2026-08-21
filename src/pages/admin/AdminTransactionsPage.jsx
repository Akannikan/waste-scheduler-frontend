import { useEffect, useState } from 'react';
import { getTransactions } from '../../api';
import { formatNaira } from '../../utils/currency';

export default function AdminTransactionsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getTransactions().then((res) => setItems(res.data.transactions || [])).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Search and review transaction activity, platform commissions, and payment statuses.</p>
        </div>
      </div>
      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Collector</th>
              <th>Amount</th>
              <th>Commission</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="7">No transactions yet.</td></tr> : items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.booking?.bookingReference || 'N/A'}</td>
                <td>{item.customer?.name || '—'}</td>
                <td>{item.collector?.name || '—'}</td>
                <td>{formatNaira(item.amount)}</td>
                <td>{formatNaira(item.commission)}</td>
                <td><span className={`badge ${item.status === 'successful' ? 'badge-green' : item.status === 'pending' ? 'badge-orange' : 'badge-grey'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
