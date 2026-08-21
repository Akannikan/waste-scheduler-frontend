import { Link } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';

export default function PaymentSuccessPage() {
  return (
    <div className="card" style={{ maxWidth: 620, margin: '40px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 60, color: 'var(--color-success)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <MdCheckCircle />
      </div>
      <h1 className="page-title">Payment successful</h1>
      <p className="page-subtitle">Your collection request has been confirmed and the payment status is successful.</p>
      <Link to="/transactions" className="btn btn-primary" style={{ marginTop: 16 }}>View transactions</Link>
    </div>
  );
}
