import { useEffect, useState } from 'react';
import { createSubscription, getSubscriptionPlans, getCurrentSubscription } from '../../api';
import toast from 'react-hot-toast';
import { formatNaira } from '../../utils/currency';

export default function CollectorSubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    Promise.all([getSubscriptionPlans(), getCurrentSubscription()])
      .then(([plansRes, currentRes]) => {
        setPlans(plansRes.data.plans || []);
        setCurrent(currentRes.data.subscription);
        setSelected((currentRes.data.subscription?.planId || plansRes.data.plans?.[0]?.id || '').toString());
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubscription({ planId: Number(selected) });
      toast.success('Subscription request submitted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collector subscription</h1>
          <p className="page-subtitle">Choose a plan that matches your collection capacity and visibility needs.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Current subscription</h3>
        <p>{current ? `${current.plan?.name} · ${current.status}` : 'No active subscription yet.'}</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {plans.map((plan) => (
            <div key={plan.id} className={`card ${selected === String(plan.id) ? 'selected-plan' : ''}`} style={{ cursor: 'pointer', border: selected === String(plan.id) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }} onClick={() => setSelected(String(plan.id))}>
              <h3>{plan.name}</h3>
              <div style={{ fontSize: 24, fontWeight: 700, margin: '8px 0' }}>{formatNaira(plan.price)}</div>
              <small>{plan.billingPeriod}</small>
              <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                {plan.features?.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">Choose plan</button>
        </div>
      </form>
    </div>
  );
}
