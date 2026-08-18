import { useState } from 'react';
import { MdClose, MdStar } from 'react-icons/md';
import { createSiteReview } from '../../api';
import toast from 'react-hot-toast';

export default function ReviewPrompt({ onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (comment.trim().length < 3) return;
    setSubmitting(true);
    try {
      await createSiteReview({ rating, comment: comment.trim() });
      localStorage.setItem('siteReviewSubmitted', 'true');
      toast.success('Thank you for your feedback');
      onSubmitted?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save your review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="card" role="dialog" aria-modal="true" aria-labelledby="review-title" style={{ width: 'min(92vw, 480px)', padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <h2 id="review-title" style={{ fontSize: 20 }}>How is WasteScheduler helping?</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close review prompt"><MdClose /></button>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 18 }}>Your feedback helps improve waste services for communities in Nigeria, especially Kwara.</p>
        <form onSubmit={submit}>
          <div className="flex" style={{ justifyContent: 'center', gap: 4, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} style={{ background: 'none', border: 0, color: value <= rating ? '#f59e0b' : 'var(--color-border)', padding: 2 }}><MdStar size={32} /></button>)}
          </div>
          <textarea className="form-control" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell us about your experience..." maxLength={500} required />
          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Later</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || comment.trim().length < 3}>{submitting ? 'Saving...' : 'Submit review'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
