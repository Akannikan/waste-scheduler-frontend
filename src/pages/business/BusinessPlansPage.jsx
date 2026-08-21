import { useEffect, useState } from 'react';
import { getBusinessPlans, createBusinessAccount } from '../../api';
import { formatNaira } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function BusinessPlansPage() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({
    organizationName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    wasteType: '',
    collectionFrequency: 'weekly',
    collectionPoints: 1,
    preferredSchedule: 'Weekdays',
    estimatedMonthlyVolume: 0,
  });

  useEffect(() => {
    getBusinessPlans().then((res) => {
      const nextPlans = res.data.plans || [];
      setPlans(nextPlans);
      if (nextPlans[0]) setSelected(String(nextPlans[0].id));
    }).catch(() => setPlans([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBusinessAccount({ ...form, planId: Number(selected) });
      toast.success('Business account request submitted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Business plans</h1>
          <p className="page-subtitle">Choose the right service plan for your organization’s waste collection requirements.</p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 20, marginBottom: 20 }}>
        {plans.map((plan) => (
          <div key={plan.id} className="card" style={{ border: selected === String(plan.id) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => setSelected(String(plan.id))}>
            <h3>{plan.name}</h3>
            <div style={{ fontSize: 26, fontWeight: 700, margin: '10px 0' }}>{formatNaira(plan.price)}</div>
            <small>{plan.billingPeriod}</small>
            <ul style={{ marginTop: 12, paddingLeft: 18 }}>
              {plan.features?.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 20 }}>
          <div className="form-group"><label className="form-label">Organization name</label><input className="form-control" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Contact person</label><input className="form-control" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Waste type</label><input className="form-control" value={form.wasteType} onChange={(e) => setForm({ ...form, wasteType: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Collection frequency</label><input className="form-control" value={form.collectionFrequency} onChange={(e) => setForm({ ...form, collectionFrequency: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Collection points</label><input type="number" className="form-control" value={form.collectionPoints} onChange={(e) => setForm({ ...form, collectionPoints: Number(e.target.value) || 1 })} min="1" /></div>
          <div className="form-group"><label className="form-label">Preferred schedule</label><input className="form-control" value={form.preferredSchedule} onChange={(e) => setForm({ ...form, preferredSchedule: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Estimated monthly volume (kg)</label><input type="number" className="form-control" value={form.estimatedMonthlyVolume} onChange={(e) => setForm({ ...form, estimatedMonthlyVolume: Number(e.target.value) || 0 })} /></div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">Submit business request</button>
        </div>
      </form>
    </div>
  );
}
