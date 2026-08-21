import { useEffect, useState } from 'react';
import { getRecyclingPartners } from '../../api';

export default function AdminRecyclingPartnersPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getRecyclingPartners().then((res) => setItems(res.data.partners || [])).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recycling partners</h1>
          <p className="page-subtitle">Monitor partner requests and recycling network registrations.</p>
        </div>
      </div>

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5">No recycling partners yet.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.role}</td>
                <td>{item.email || '—'}</td>
                <td>{item.phone || '—'}</td>
                <td><span className={`badge ${item.status === 'active' ? 'badge-green' : 'badge-grey'}`}>{item.status || 'pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
