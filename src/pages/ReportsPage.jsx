import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdReport, MdAdd, MdClose, MdMyLocation } from 'react-icons/md';
import { getReports, createReport } from '../api';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setReports(res.data.reports || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setValue('latitude', pos.coords.latitude.toFixed(6));
          setValue('longitude', pos.coords.longitude.toFixed(6));
          toast.success('Location captured');
        },
        () => toast.error('Could not get your location')
      );
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createReport({
        type: data.type,
        description: data.description,
        address: data.address,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
      });
      toast.success('Report submitted successfully');
      reset();
      setShowModal(false);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = { missed_pickup: 'Missed Pickup', illegal_dumping: 'Illegal Dumping', damaged_bin: 'Damaged Bin', other: 'Other' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reports</h1>
          <p className="page-subtitle">Report missed pickups, illegal dumping, or other waste-related issues.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> New Report
        </button>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : reports.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MdReport />}
            title="No reports yet"
            message="You haven't submitted any reports. Click 'New Report' to flag an issue in your area."
            action={<button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> New Report</button>}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>#{r.id}</td>
                    <td><span className="badge badge-orange">{typeLabel[r.type] || r.type}</span></td>
                    <td style={{ maxWidth: 280 }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{r.description}</p>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{r.address || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submit a Report</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select className={`form-control ${errors.type ? 'error' : ''}`} {...register('type', { required: 'Please select a type' })}>
                  <option value="">Select report type</option>
                  <option value="missed_pickup">Missed Pickup</option>
                  <option value="illegal_dumping">Illegal Dumping</option>
                  <option value="damaged_bin">Damaged Bin</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && <p className="form-error">{errors.type.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${errors.description ? 'error' : ''}`}
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Please provide more detail' } })}
                />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Address / Location (optional)</label>
                <input type="text" className="form-control" placeholder="123 Main Street..." {...register('address')} />
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" className="form-control" placeholder="e.g. 40.7128" {...register('latitude')} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" className="form-control" placeholder="e.g. -74.0060" {...register('longitude')} />
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={getLocation}>
                <MdMyLocation /> Use My Location
              </button>

              <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
