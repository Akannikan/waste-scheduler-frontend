import { useEffect, useState } from 'react';
import { MdClose, MdSend, MdRefresh } from 'react-icons/md';
import { createAssignmentMessage, getAssignment } from '../../api';
import { InlineSpinner } from './LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AssignmentConversation({ assignmentId, currentUserId, onClose }) {
  const [assignment, setAssignment] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversation = async () => {
    try {
      const response = await getAssignment(assignmentId);
      setAssignment(response.data.assignment);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
    const interval = window.setInterval(loadConversation, 30000);
    return () => window.clearInterval(interval);
  }, [assignmentId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await createAssignmentMessage(assignmentId, { message: message.trim() });
      setMessage('');
      await loadConversation();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal conversation-modal" role="dialog" aria-modal="true" aria-labelledby="conversation-title" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="conversation-kicker">Assignment conversation</div>
            <h2 id="conversation-title" className="modal-title">{assignment?.title || 'Loading conversation'}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close conversation" aria-label="Close conversation"><MdClose /></button>
        </div>

        <div className="conversation-messages">
          {loading ? <div className="conversation-empty"><InlineSpinner /></div> : assignment?.messages?.length ? assignment.messages.map(item => (
            <div key={item.id} className={`conversation-message ${item.senderId === currentUserId ? 'is-mine' : ''}`}>
              <div className="conversation-message__meta">{item.sender?.name || 'User'} · {new Date(item.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <div>{item.message}</div>
            </div>
          )) : <div className="conversation-empty">No messages yet. Start the conversation.</div>}
        </div>

        <form className="conversation-compose" onSubmit={sendMessage}>
          <textarea value={message} onChange={event => setMessage(event.target.value)} rows={2} maxLength={1000} placeholder="Write an update or ask a question..." aria-label="Message" />
          <div className="conversation-compose__actions">
            <button type="button" className="btn btn-ghost btn-icon" onClick={loadConversation} title="Refresh conversation" aria-label="Refresh conversation"><MdRefresh /></button>
            <button type="submit" className="btn btn-primary" disabled={sending || !message.trim()}>
              {sending ? <InlineSpinner /> : <MdSend />} Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
