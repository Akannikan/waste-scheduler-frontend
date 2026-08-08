import { useEffect, useState } from 'react';
import { MdStar, MdTimer, MdEmojiEvents, MdCheckCircle, MdCancel, MdLeaderboard } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import client from '../api/client';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = { easy: '#2E7D32', medium: '#FF9800', hard: '#D32F2F' };

// ── Quiz Card ────────────────────────────────────────────────
function QuizCard({ quiz, onStart }) {
  return (
    <div className="card quiz-card" style={{ cursor: 'pointer' }} onClick={() => onStart(quiz)}>
      <div className="flex items-center justify-between mb-3">
        <span className="badge" style={{ background: `${DIFFICULTY_COLORS[quiz.difficulty]}20`, color: DIFFICULTY_COLORS[quiz.difficulty], textTransform: 'capitalize' }}>
          {quiz.difficulty}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>⏱ {quiz.timeLimit}s/question</span>
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{quiz.title}</h3>
      {quiz.description && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{quiz.description}</p>}
      <div className="flex gap-3" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        <span>❓ {quiz._count?.questions || 0} questions</span>
        <span>⭐ {quiz.points} pts bonus</span>
        <span>🏆 {quiz._count?.attempts || 0} attempts</span>
      </div>
      <button className="btn btn-primary w-full mt-4">Start Quiz →</button>
    </div>
  );
}

// ── Active Quiz ───────────────────────────────────────────────
function ActiveQuiz({ quiz, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);
  const [submitting, setSubmitting] = useState(false);

  const question = quiz.questions[current];
  const total = quiz.questions.length;

  useEffect(() => {
    setTimeLeft(quiz.timeLimit);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleNext(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [current]);

  const handleAnswer = (idx) => {
    if (answers[question.id] !== undefined) return;
    setAnswers(prev => ({ ...prev, [question.id]: idx }));
  };

  const handleNext = (auto = false) => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await client.post(`/quiz/${quiz.id}/submit`, { answers });
      onComplete(data);
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((current + 1) / total) * 100;
  const timerPct = (timeLeft / quiz.timeLimit) * 100;

  return (
    <div className="quiz-active">
      {/* Header */}
      <div className="quiz-header">
        <div>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Question {current + 1} of {total}</span>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="quiz-timer" style={{ color: timeLeft <= 10 ? 'var(--color-danger)' : 'var(--color-text)' }}>
          <MdTimer size={18} />
          <span>{timeLeft}s</span>
          <div className="timer-bar"><div className="timer-fill" style={{ width: `${timerPct}%`, background: timeLeft <= 10 ? 'var(--color-danger)' : 'var(--color-primary)' }} /></div>
        </div>
      </div>

      {/* Question */}
      <div className="card quiz-question-card">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, lineHeight: 1.4 }}>{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((opt, idx) => {
            const selected = answers[question.id] === idx;
            return (
              <button
                key={idx}
                className={`quiz-option ${selected ? 'selected' : ''} ${answers[question.id] !== undefined && !selected ? 'disabled' : ''}`}
                onClick={() => handleAnswer(idx)}
              >
                <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            className="btn btn-primary"
            onClick={() => handleNext()}
            disabled={answers[question.id] === undefined || submitting}
          >
            {current < total - 1 ? 'Next →' : submitting ? 'Submitting...' : 'Submit Quiz ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────
function QuizResults({ result, quiz, onRetry, onBack }) {
  const pct = Math.round((result.attempt.score / result.attempt.totalPoints) * 100);
  return (
    <div className="card quiz-results">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{result.attempt.passed ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: result.attempt.passed ? 'var(--color-primary)' : 'var(--color-accent)' }}>
          {result.attempt.passed ? 'Excellent Work!' : 'Keep Trying!'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>{result.message}</p>
      </div>

      {/* Score circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(var(--color-primary) ${pct * 3.6}deg, var(--color-surface-2) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{pct}%</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{result.attempt.score}/{result.attempt.totalPoints}</span>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4" style={{ gap: 12 }}>
        <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>+{result.attempt.earnedPoints}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Points Earned</div>
        </div>
        <div style={{ background: result.attempt.passed ? 'rgba(46,125,50,0.08)' : 'rgba(255,152,0,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 22 }}>{result.attempt.passed ? '🏆' : '📚'}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{result.attempt.passed ? 'Passed!' : 'Need 60%'}</div>
        </div>
      </div>

      {/* Answer review */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Answer Review</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {result.results.map((r, i) => (
          <div key={i} style={{ background: r.correct ? 'rgba(46,125,50,0.06)' : 'rgba(211,47,47,0.06)', borderRadius: 10, padding: '12px 16px', borderLeft: `3px solid ${r.correct ? 'var(--color-primary)' : 'var(--color-danger)'}` }}>
            <div className="flex items-center gap-2 mb-1">
              {r.correct ? <MdCheckCircle color="var(--color-primary)" /> : <MdCancel color="var(--color-danger)" />}
              <span style={{ fontSize: 13, fontWeight: 600 }}>Q{i + 1}: {r.question.slice(0, 60)}{r.question.length > 60 ? '...' : ''}</span>
            </div>
            {r.explanation && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>💡 {r.explanation}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-outline flex-1" onClick={onBack}>← All Quizzes</button>
        <button className="btn btn-primary flex-1" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────
function Leaderboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    client.get('/quiz/leaderboard/top').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="page-loading"><div className="spinner" /></div>;

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div>
      {data.myRank && (
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', color: '#fff', border: 'none' }}>
          <div className="flex items-center gap-4">
            <div style={{ fontSize: 36 }}>🏆</div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Your Rank</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>#{data.myRank}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Your Points</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{data.myPoints}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="card-title"><MdLeaderboard style={{ marginRight: 8, verticalAlign: 'middle' }} />Top Recyclers</h3>
        </div>
        {data.leaderboard.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < data.leaderboard.length - 1 ? '1px solid var(--color-border)' : 'none', background: i < 3 ? `${['rgba(255,215,0,0.05)', 'rgba(192,192,192,0.05)', 'rgba(205,127,50,0.05)'][i]}` : 'transparent' }}>
            <span style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, minWidth: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {i < 3 ? medal[i] : `#${entry.rank}`}
            </span>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {entry.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</div>
              {entry.badges?.length > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{entry.badges.length} badge{entry.badges.length > 1 ? 's' : ''}</div>}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>{entry.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function QuizPage() {
  const [tab, setTab] = useState('quizzes');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    client.get('/quiz').then(r => setQuizzes(r.data.quizzes || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const startQuiz = (quiz) => { setActiveQuiz(quiz); setResult(null); };
  const onComplete = (res) => { setResult(res); setActiveQuiz(null); };
  const onRetry = () => { const q = activeQuiz || quizzes.find(q => q.id === result?.attempt?.quizId); if (q) startQuiz(q); };
  const onBack = () => { setActiveQuiz(null); setResult(null); };

  // Show active quiz
  if (activeQuiz) return (
    <div>
      <button className="btn btn-ghost mb-4" onClick={onBack}>← Back</button>
      <ActiveQuiz quiz={activeQuiz} onComplete={onComplete} />
    </div>
  );

  // Show results
  if (result) return (
    <div>
      <QuizResults result={result} onRetry={onRetry} onBack={onBack} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eco Quiz 🎮</h1>
          <p className="page-subtitle">Test your recycling knowledge, earn points, and win badges!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['quizzes', '🎯 Quizzes'], ['leaderboard', '🏆 Leaderboard']].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && (
        loading ? <PageLoading /> :
        quizzes.length === 0 ? (
          <div className="card"><EmptyState icon={<MdStar />} title="No quizzes yet" message="Quizzes are coming soon! Check back later." /></div>
        ) : (
          <div className="grid-2">{quizzes.map(q => <QuizCard key={q.id} quiz={q} onStart={startQuiz} />)}</div>
        )
      )}

      {tab === 'leaderboard' && <Leaderboard />}
    </div>
  );
}
