import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getZones, initializePayment } from '../api';
import toast from 'react-hot-toast';
import { formatNaira } from '../utils/currency';

const wasteTypes = [
  { id: 'recyclable', name: 'Recyclable', bin: 'Blue Bin', color: '#1976D2', description: 'Plastic, paper, cans', icon: '♻️' },
  { id: 'organic', name: 'Organic', bin: 'Green Bin', color: '#2E7D32', description: 'Food scraps, garden waste', icon: '🌿' },
  { id: 'general', name: 'General', bin: 'Black Bin', color: '#374151', description: 'Mixed household waste', icon: '🗑️' },
  { id: 'hazardous', name: 'Hazardous', bin: 'Red Bin', color: '#D32F2F', description: 'Batteries, e-waste', icon: '⚠️' },
];

const timeSlots = ['7:00 AM', '9:00 AM', '12:00 PM', '3:30 PM', '5:00 PM'];
const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const initialBooking = {
  wasteType: 'recyclable',
  quantity: 12,
  unit: 'kg',
  state: 'Kwara',
  area: 'Tanke, Ilorin',
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  time: '9:00 AM',
  amount: 2600,
};

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialBooking);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    getZones()
      .then((response) => setZones(response.data.zones || []))
      .catch(() => toast.error('Unable to load service areas'));
  }, []);

  const states = [...NIGERIAN_STATES].sort((left, right) => {
    if (left === 'Kwara') return -1;
    if (right === 'Kwara') return 1;
    return left.localeCompare(right);
  });

  const selectedWaste = wasteTypes.find((item) => item.id === form.wasteType) || wasteTypes[0];
  const estimatedAmount = useMemo(() => {
    const base = Number(form.quantity || 0) * (form.unit === 'bags' ? 150 : 120);
    return Math.max(base, 1500) + 450;
  }, [form.quantity, form.unit]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, amount: estimatedAmount }));
  }, [estimatedAmount]);

  const breakdown = useMemo(() => {
    const total = Number(form.amount || 0);
    const platformFee = total * 0.1;
    return {
      service: total,
      platformFee,
      total: total + platformFee,
    };
  }, [form.amount]);

  const nextStep = () => setStep((current) => Math.min(current + 1, 7));
  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await initializePayment({
        serviceName: `${selectedWaste.name} waste collection`,
        amount: String(form.amount),
        bookingId: `WS-${Date.now()}`,
        collectionDate: form.date,
        collectionTime: form.time,
        location: `${form.area}, ${form.state}`,
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

  const stepLabels = ['Waste Type', 'Quantity', 'Location', 'Date', 'Time', 'Review', 'Confirm'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule Waste Collection</h1>
          <p className="page-subtitle">A simple guided flow for cleaner estates and residential neighborhoods.</p>
        </div>
      </div>

      <div className="card modern-scheduler" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="schedule-stepper" style={{ padding: '18px 20px 8px' }}>
          {stepLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`step-pill ${step === index + 1 ? 'active' : ''}`}
              onClick={() => setStep(index + 1)}
              disabled={index > step - 1}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {step === 1 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 1 of 7</p>
                <h2>Choose waste type</h2>
              </div>
              <div className="choice-grid">
                {wasteTypes.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={`choice-card ${form.wasteType === category.id ? 'selected' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, wasteType: category.id }))}
                    style={{ borderColor: form.wasteType === category.id ? category.color : 'var(--color-border)' }}
                  >
                    <span className="choice-icon" style={{ background: `${category.color}18`, color: category.color }}>{category.icon}</span>
                    <div className="choice-copy">
                      <div className="choice-title-row">
                        <strong>{category.name}</strong>
                        <span className="choice-bin" style={{ color: category.color }}>{category.bin}</span>
                      </div>
                      <small>{category.description}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 2 of 7</p>
                <h2>Set quantity</h2>
              </div>

              <div className="quantity-box">
                <div className="quantity-controls">
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, quantity: Math.max(1, Number(prev.quantity) - 1) }))}>−</button>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))}
                  />
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, quantity: Number(prev.quantity) + 1 }))}>+</button>
                </div>

                <div className="segmented-control">
                  {['kg', 'bags', 'trucks'].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      className={form.unit === unit ? 'active' : ''}
                      onClick={() => setForm((prev) => ({ ...prev, unit }))}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 3 of 7</p>
                <h2>Location details</h2>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select
                    className="form-control"
                    value={form.state}
                    onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                    disabled={zones.length === 0}
                  >
                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Area / Community</label>
                  <input
                    className="form-control"
                    value={form.area}
                    onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                    placeholder="e.g. Omole Phase 1"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 4 of 7</p>
                <h2>Pick collection date</h2>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 5 of 7</p>
                <h2>Select a time slot</h2>
              </div>
              <div className="choice-grid compact">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`choice-card small ${form.time === slot ? 'selected' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                  >
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 6 of 7</p>
                <h2>Review your booking</h2>
              </div>

              <div className="summary-card">
                <div className="summary-row"><span>Waste type</span><strong>{selectedWaste.name}</strong></div>
                <div className="summary-row"><span>Bin</span><strong>{selectedWaste.bin}</strong></div>
                <div className="summary-row"><span>Quantity</span><strong>{form.quantity} {form.unit}</strong></div>
                <div className="summary-row"><span>Location</span><strong>{form.area}, {form.state}</strong></div>
                <div className="summary-row"><span>Date</span><strong>{new Date(form.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                <div className="summary-row"><span>Time</span><strong>{form.time}</strong></div>
                <div className="summary-row total"><span>Estimated cost</span><strong>{formatNaira(breakdown.total)}</strong></div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <div className="section-head">
                <p className="section-kicker">Step 7 of 7</p>
                <h2>Confirm collection</h2>
              </div>

              <div className="confirmation-panel">
                <div className="confirmation-icon" style={{ background: `${selectedWaste.color}18`, color: selectedWaste.color }}>{selectedWaste.icon}</div>
                <h3>Your collection is ready</h3>
                <p>We'll send a driver to {form.area}, {form.state} on {new Date(form.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} at {form.time}.</p>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm Collection'}
                </button>
              </div>
            </div>
          )}

          <div className="scheduler-actions" style={{ marginTop: 24 }}>
            {step > 1 && step < 7 && (
              <button type="button" className="btn btn-ghost" onClick={prevStep}>Previous</button>
            )}
            {step < 6 && (
              <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>
            )}
            {step === 6 && (
              <button type="button" className="btn btn-primary" onClick={nextStep}>Review & confirm</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
