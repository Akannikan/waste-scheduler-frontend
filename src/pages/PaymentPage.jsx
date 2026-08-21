import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyPayment } from '../api';
import { formatNaira } from '../utils/currency';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('checkout');
      if (stored) setCheckout(JSON.parse(stored));
    } catch {
      setCheckout(null);
    }
  }, []);

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const bookingId = checkout?.booking?.bookingReference;
      const paymentReference = checkout?.paymentReference;
      if (!bookingId || !paymentReference) {
        throw new Error('Checkout payment reference is missing');
      }
      await verifyPayment({ bookingId, paymentReference, status: 'successful' });
      toast.success('Payment successful.');
      navigate('/payment-success');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      navigate('/payment-failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!checkout) return <div className="card"><p>Checkout data missing. Please book a collection first.</p></div>;

  const breakdown = checkout.breakdown || { service: 0, platformFee: 0, total: 0 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment</h1>
          <p className="page-subtitle">Complete your collection booking with a secure cashless flow.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
        <h3 className="card-title">Review your booking</h3>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service</span><strong>{checkout.booking?.serviceName || 'Waste Collection'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Collection date</span><strong>{checkout.booking?.collectionDate || 'Not specified'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Location</span><strong>{checkout.booking?.location || 'Not specified'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Amount</span><strong>{formatNaira(breakdown.service)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform fee</span><strong>{formatNaira(breakdown.platformFee)}</strong></div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>{formatNaira(breakdown.total)}</span></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={handleSubmit} disabled={processing}>
          {processing ? 'Processing payment...' : 'Pay now'}
        </button>
      </div>
    </div>
  );
}
