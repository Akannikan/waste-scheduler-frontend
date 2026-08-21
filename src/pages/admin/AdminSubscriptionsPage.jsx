import { useEffect, useState } from 'react';
import { getSubscriptionPlans } from '../../api';
import { formatNaira } from '../../utils/currency';

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getSubscriptionPlans().then((res) => setPlans(res.data.plans || [])).catch(() => setPlans([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collector plans</h1>
          <p className="page-subtitle">Review active monetization packages available to collectors.</p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 20 }}>
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <h3>{plan.name}</h3>
            <div style={{ fontSize: 26, fontWeight: 700, margin: '10px 0' }}>{formatNaira(plan.price)}</div>
            <small>{plan.billingPeriod}</small>
            <ul style={{ marginTop: 12, paddingLeft: 18 }}>
              {plan.features?.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
