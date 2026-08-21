import { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import { formatNaira } from '../utils/currency';

export default function TransactionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then((res) => setItems(res.data.transactions || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Track your payment history, booking fees, and status updates.</p>
        </div>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Collector</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="5">No transactions found.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td>{item.booking?.bookingReference || 'N/A'}</td>
                  <td><span className={`badge ${item.status === 'successful' ? 'badge-green' : item.status === 'pending' ? 'badge-orange' : 'badge-grey'}`}>{item.status}</span></td>
                  <td>{formatNaira(item.amount)}</td>
                  <td>{formatNaira(item.commission)}</td>
                  <td>{item.collector?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
