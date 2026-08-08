const statusMap = {
  // Schedule statuses
  scheduled: { label: 'Scheduled', cls: 'badge-blue' },
  completed: { label: 'Completed', cls: 'badge-green' },
  missed: { label: 'Missed', cls: 'badge-red' },
  cancelled: { label: 'Cancelled', cls: 'badge-grey' },
  // Report statuses
  pending: { label: 'Pending', cls: 'badge-orange' },
  under_review: { label: 'Under Review', cls: 'badge-blue' },
  resolved: { label: 'Resolved', cls: 'badge-green' },
  rejected: { label: 'Rejected', cls: 'badge-red' },
  // User roles
  admin: { label: 'Admin', cls: 'badge-red' },
  collector: { label: 'Collector', cls: 'badge-blue' },
  resident: { label: 'Resident', cls: 'badge-green' },
};

export default function StatusBadge({ status }) {
  const config = statusMap[status] || { label: status, cls: 'badge-grey' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
