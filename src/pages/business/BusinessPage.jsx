import { Link } from 'react-router-dom';

export default function BusinessPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Business waste solutions</h1>
          <p className="page-subtitle">Manage recurring commercial pickups, service levels, and account plans for your organization.</p>
        </div>
      </div>

      <div className="card">
        <p>Commercial waste management requires a dedicated service plan. Use your business profile to request recurring pickups, estimate volume, and review pricing.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/business/plans" className="btn btn-primary">View business plans</Link>
          <Link to="/business/dashboard" className="btn btn-secondary">Business dashboard</Link>
        </div>
      </div>
    </div>
  );
}
