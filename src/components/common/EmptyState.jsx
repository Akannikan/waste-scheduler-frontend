import { MdInbox } from 'react-icons/md';

export default function EmptyState({ icon, title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <MdInbox />}</div>
      <div className="empty-state-title">{title}</div>
      {message && <p className="empty-state-text">{message}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
