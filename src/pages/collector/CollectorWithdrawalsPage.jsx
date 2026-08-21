import { useEffect, useState } from 'react';
import { getCollectorWithdrawals, requestWithdrawal } from '../../api';
import { formatNaira } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function CollectorWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({ amount: '', bankName: 'First Bank', accountName: '', accountNumber: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    getCollectorWithdrawals()
      .then((res) => setWithdrawals(res.data.withdrawals || []))
      .catch(() => setWithdrawals([]));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestWithdrawal(form);
      toast.success('Withdrawal request submitted.');
      setForm({ amount: '', bankName: 'First Bank', accountName: '', accountNumber: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to request withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawals</h1>
          <p className="page-subtitle">Add your bank details, request a payout, and track the review state.</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <form className="card" onSubmit={handleSubmit}>
          <h3 className="card-title">Request withdrawal</h3>
          <div className="form-group">
            <label className="form-label">Amount (NGN)</label>
            <input type="number" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Bank name</label>
            <input className="form-control" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Account name</label>
            <input className="form-control" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Account number</label>
            <input className="form-control" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Request withdrawal'}</button>
        </form>

        <div className="card table-wrapper">
          <h3 className="card-title">Withdrawal history</h3>
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Bank</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr><td colSpan="4">No withdrawals requested yet.</td></tr>
              ) : withdrawals.map((item) => (
                <tr key={item.id}>
                  <td>{formatNaira(item.amount)}</td>
                  <td>{item.bankName || 'Bank transfer'}</td>
                  <td><span className={`badge ${item.status === 'successful' ? 'badge-green' : item.status === 'pending' ? 'badge-orange' : 'badge-grey'}`}>{item.status}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString('en-NG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
