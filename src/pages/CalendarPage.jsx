import { useEffect, useState } from 'react';
import { getWasteBin } from '../utils/wasteBins';
import Calendar from 'react-calendar';
import { MdCalendarToday } from 'react-icons/md';
import { getSchedules } from '../api';

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const [value, setValue] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedules({ limit: 100 })
      .then((res) => setSchedules(res.data.schedules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const schedulesOnDay = (date) =>
    schedules.filter((s) => sameDay(new Date(s.pickupDate), date));

  const selectedDaySchedules = schedulesOnDay(value);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayItems = schedulesOnDay(date);
    if (dayItems.length === 0) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
        {dayItems.slice(0, 3).map((s, i) => (
          <div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: s.category?.color || 'var(--color-primary)' }}
          />
        ))}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayItems = schedulesOnDay(date);
    if (dayItems.length > 0) return 'has-event';
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collection Calendar</h1>
          <p className="page-subtitle">View your waste pickup dates on an interactive calendar.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Calendar */}
        <div>
          <Calendar
            onChange={setValue}
            value={value}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
          {/* Legend */}
          <div className="card mt-4">
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Waste Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Organic', color: '#8D6E63', day: 'Monday' },
                { name: 'Plastic & Metal', color: '#1976D2', day: 'Tuesday' },
                { name: 'Paper', color: '#FFA726', day: 'Wednesday' },
                { name: 'Glass', color: '#66BB6A', day: 'Thursday' },
                { name: 'E-Waste', color: '#7E57C2', day: 'Monthly' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected day details */}
        <div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>
              <MdCalendarToday style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {value.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>

            {loading ? (
              <p className="text-muted text-sm">Loading schedules...</p>
            ) : selectedDaySchedules.length === 0 ? (
              <p className="text-muted text-sm" style={{ padding: '20px 0', textAlign: 'center' }}>
                No pickups scheduled for this day.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedDaySchedules.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${s.category?.color}`,
                      background: 'var(--color-surface-2)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.category?.name} Collection</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                      🗓 {new Date(s.pickupDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      📍 {s.zone?.name} ({s.zone?.code})
                    </div>
                    <div style={{ fontSize: 13 }}>
                      🗑 Place in: <strong>{getWasteBin(s.category).name}</strong>
                    </div>
                    {s.category?.tips?.[0] && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-primary)', background: 'rgba(46,125,50,0.08)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                        💡 {s.category.tips[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`.has-event { background: rgba(46,125,50,0.06) !important; font-weight: 600; }`}</style>
    </div>
  );
}
