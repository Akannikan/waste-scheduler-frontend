import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRecycling, MdDeleteSweep } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getMyWasteLogs } from '../api';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import { getWasteBin, summarizeWasteBins } from '../utils/wasteBins';

export default function DashboardPage() {
  const { user } = useAuth();
  const [wasteLogs, setWasteLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWasteLogs = async () => {
      try {
        const waste = await getMyWasteLogs();
        setWasteLogs(waste.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWasteLogs();
  }, []);

  const wasteBins = summarizeWasteBins(wasteLogs);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Track your waste, reduce your environmental impact.</p>
        </div>
        <Link to="/waste-log" className="btn btn-primary">
          <MdRecycling /> Log Waste
        </Link>
      </div>

      {loading ? (
        <div className="grid-2"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          <section className="dashboard-bins-section" aria-labelledby="waste-bins-title">
            <div className="card-header dashboard-bins-header">
              <div>
                <p className="section-kicker">Waste sorting</p>
                <h2 id="waste-bins-title" className="dashboard-bins-title">Your three-bin view</h2>
                <p className="text-muted text-sm">Choose a waste type when logging. Its destination is assigned automatically.</p>
              </div>
              <Link to="/waste-log" className="btn btn-primary btn-sm"><MdRecycling /> Log waste</Link>
            </div>
            <div className="dashboard-bins-grid">
              {wasteBins.map(bin => {
                const Icon = bin.icon === 'organic' ? FaLeaf : bin.icon === 'residual' ? MdDeleteSweep : MdRecycling;
                return (
                  <article key={bin.id} className="waste-bin-card" style={{ '--bin-color': bin.color, '--bin-soft-color': bin.softColor }}>
                    <div className="waste-bin-visual">
                      <div className="waste-bin-lid" />
                      <div className="waste-bin-body"><Icon size={42} /></div>
                    </div>
                    <div className="waste-bin-copy">
                      <div className="waste-bin-name-row">
                        <h3>{bin.name}</h3>
                        <span className="waste-bin-status">Active</span>
                      </div>
                      <p className="waste-bin-category">{bin.category}</p>
                      <p className="waste-bin-description">{bin.description}</p>
                      <div className="waste-bin-total">
                        <strong>{bin.quantityKg.toFixed(1)} kg</strong>
                        <span>{bin.entries} {bin.entries === 1 ? 'entry' : 'entries'}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
