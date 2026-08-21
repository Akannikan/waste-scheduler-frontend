import { Link } from 'react-router-dom';
import { MdErrorOutline } from 'react-icons/md';

export default function PaymentFailedPage() {
  return (
    <div className="card" style={{ maxWidth: 620, margin: '40px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 60, color: 'var(--color-danger)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <MdErrorOutline />
      </div>
      <h1 className="page-title">Payment failed</h1>
      <p className="page-subtitle">Payment could not be completed. Please try again or choose a different method.</p>
      <Link to="/book-collection" className="btn btn-primary" style={{ marginTop: 16 }}>Back to booking</Link>
    </div>
  );
}
