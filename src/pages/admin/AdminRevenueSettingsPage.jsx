import { useEffect, useState } from 'react';
import { getRevenueSettings, updateRevenueSettings } from '../../api';
import toast from 'react-hot-toast';

export default function AdminRevenueSettingsPage() {
  const [settings, setSettings] = useState({ commissionRate: 10, minimumWithdrawalAmount: 5000, currency: 'NGN', customerServiceFee: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRevenueSettings()
      .then((res) => setSettings(res.data.settings || settings))
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRevenueSettings(settings);
      toast.success('Revenue settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue settings</h1>
          <p className="page-subtitle">Control the commission structure and payout thresholds for the platform.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Commission rate (%)</label>
            <input type="number" className="form-control" value={settings.commissionRate} onChange={(e) => handleChange('commissionRate', Number(e.target.value))} min="0" max="100" />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum withdrawal (NGN)</label>
            <input type="number" className="form-control" value={settings.minimumWithdrawalAmount} onChange={(e) => handleChange('minimumWithdrawalAmount', Number(e.target.value))} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <input className="form-control" value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer service fee (NGN)</label>
            <input type="number" className="form-control" value={settings.customerServiceFee} onChange={(e) => handleChange('customerServiceFee', Number(e.target.value))} min="0" />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  );
}
