import { useEffect, useState } from 'react';
import { getBusinessAccounts } from '../../api';

export default function BusinessDashboardPage() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    getBusinessAccounts().then((res) => setAccounts(res.data.accounts || [])).catch(() => setAccounts([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Business dashboard</h1>
          <p className="page-subtitle">Track active account requests and recurring partner service statuses.</p>
        </div>
      </div>

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Contact</th>
              <th>Waste type</th>
              <th>Frequency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan="5">No business account requests yet.</td></tr>
            ) : accounts.map((item) => (
              <tr key={item.id}>
                <td>{item.organizationName}</td>
                <td>{item.contactPerson}</td>
                <td>{item.wasteType}</td>
                <td>{item.collectionFrequency}</td>
                <td><span className={`badge ${item.status === 'pending' ? 'badge-orange' : 'badge-green'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
