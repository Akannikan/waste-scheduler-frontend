import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializePayment } from '../api';
import toast from 'react-hot-toast';
import { formatNaira } from '../utils/currency';

const initialBooking = {
  serviceName: 'Waste collection',
  collectionDate: new Date().toISOString().slice(0, 10),
  collectionTime: '09:00',
  location: 'Lagos Island',
  amount: 2000,
};

export default function BookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialBooking);
  const [loading, setLoading] = useState(false);

  const breakdown = useMemo(() => {
    const total = Number(form.amount || 0);
    const commissionRate = 10;
    const platformFee = total * (commissionRate / 100);
    return {
      service: total,
      platformFee,
      total: total + platformFee,
      commissionRate,
    };
  }, [form.amount]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await initializePayment({
        serviceName: form.serviceName,
        amount: String(form.amount),
        bookingId: `WS-${Date.now()}`,
        collectionDate: form.collectionDate,
        collectionTime: form.collectionTime,
        location: form.location,
        provider: 'manual',
      });

      const payload = { ...res.data, booking: res.data.booking || {}, breakdown };
      localStorage.setItem('checkout', JSON.stringify(payload));
      toast.success('Booking created. Review your payment summary.');
      navigate('/payment');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Collection</h1>
          <p className="page-subtitle">Select a service and confirm your payment summary before checkout.</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <section className="card">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Service</label>
              <input className="form-control" value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} />
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Collection date</label>
                <input type="date" className="form-control" value={form.collectionDate} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Collection time</label>
                <input type="time" className="form-control" value={form.collectionTime} onChange={(e) => setForm({ ...form, collectionTime: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input type="number" min="1" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Continue to payment'}
            </button>
          </form>
        </section>

        <aside className="card">
          <h3 className="card-title">Price breakdown</h3>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Waste collection</span>
              <strong>{formatNaira(breakdown.service)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Platform fee</span>
              <strong>{formatNaira(breakdown.platformFee)}</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span>{formatNaira(breakdown.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
