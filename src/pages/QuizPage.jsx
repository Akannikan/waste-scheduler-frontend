import { useEffect, useState, useRef, useCallback } from 'react';
import { MdStar, MdCheckCircle, MdCancel, MdLeaderboard, MdRefresh, MdPlayArrow } from 'react-icons/md';
import client from '../api/client';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Helpers ────────────────────────────────────────────────────
const DIFF_COLORS  = { easy: '#2E7D32', medium: '#FF9800', hard: '#D32F2F', advanced: '#7E57C2', expert: '#263238' };
const DIFF_LABELS  = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard', advanced: '🟣 Advanced', expert: '⚫ Expert' };
const QUIZ_DURATIONS = { easy: 180, medium: 300, hard: 600, advanced: 720, expert: 900 };
const GAME_MODES = {
  classic: { label: 'Classic Quiz', description: 'Take your time and learn from every answer.', icon: '🎯', timeMultiplier: 1 },
  speed: { label: 'Speed Round', description: 'Half the time. Fast thinking earns bragging rights.', icon: '⚡', timeMultiplier: 0.5 },
  sprint: { label: 'Quick Sprint', description: 'A compact five-question challenge for fast practice.', icon: '🔥', timeMultiplier: 0.75 },
};
const CACHE_KEY    = 'ws_quiz_cache_v2';
const CACHE_TTL    = 10 * 60 * 1000;

function saveCache(d) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ d, ts: Date.now() })); } catch {}
}
function loadCache() {
  try {
    const r = localStorage.getItem(CACHE_KEY);
    if (!r) return null;
    const { d, ts } = JSON.parse(r);
    return Date.now() - ts < CACHE_TTL ? d : null;
  } catch { return null; }
}

// ── Quiz card (lobby) ─────────────────────────────────────────
function QuizCard({ quiz, onStart }) {
  const col = DIFF_COLORS[quiz.difficulty] || '#888';
  const locked = quiz.isUnlocked === false;

  return (
    <div className="card" style={{
      borderTop: `3px solid ${locked ? '#9ca3af' : col}`,
      cursor: locked ? 'not-allowed' : 'pointer',
      opacity: locked ? 0.6 : 1,
      transition: 'transform .18s, box-shadow .18s',
      filter: locked ? 'grayscale(0.15)' : 'none',
    }}
      onMouseOver={e => { if (!locked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      onClick={() => !locked && onStart(quiz)}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: `${col}18`, color: locked ? '#6b7280' : col }}>{locked ? '🔒 Locked' : DIFF_LABELS[quiz.difficulty]}</span>
        {quiz.category && <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{quiz.category.replace('_', ' ')}</span>}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{quiz.title}</h3>
      {quiz.description && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.6 }}>{quiz.description}</p>}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 18 }}>
        <span>❓ {quiz._count?.questions || 0} questions</span>
        <span>⏱ {Math.round((QUIZ_DURATIONS[quiz.difficulty] || 180) / 60)} min</span>
        <span>⭐ +{quiz.points} pts</span>
      </div>
      <button className="btn btn-primary w-full" disabled={locked} style={{ opacity: locked ? 0.8 : 1 }}>
        {locked ? 'Complete the previous level' : <><MdPlayArrow size={18} /> Start Quiz</>}
      </button>
    </div>
  );
}

// ── Active quiz ───────────────────────────────────────────────
function GameModePicker({ quiz, onStart, onBack }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button className="btn btn-ghost mb-4" onClick={onBack}>← All Quizzes</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">Choose your game</h1>
          <p className="page-subtitle">{quiz.title} · {quiz._count?.questions || quiz.questions?.length || 0} questions</p>
        </div>
      </div>
      <div className="grid-2">
        {Object.entries(GAME_MODES).map(([key, mode]) => (
          <button key={key} className="card game-mode-card" onClick={() => onStart(quiz, key)}>
            <span className="game-mode-icon">{mode.icon}</span>
            <strong>{mode.label}</strong>
            <span>{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActiveQuiz({ quiz, mode = 'classic', onComplete, onBack }) {
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});   // { questionId: selectedIndex }
  const [phase,      setPhase]      = useState('answering'); // 'answering' | 'feedback' | 'submitting'
  const gameMode = GAME_MODES[mode] || GAME_MODES.classic;
  const totalTime = Math.round((QUIZ_DURATIONS[quiz.difficulty] || 180) * gameMode.timeMultiplier);
  const [timeLeft,   setTimeLeft]   = useState(totalTime);

  // ── CRITICAL: keep a ref that is ALWAYS current ──────────
  // The setInterval callback cannot read React state directly —
  // it captures the value from when the effect ran.
  // We use a ref as a "write-through cache" for answers.
  const answersRef  = useRef({});
  const currentRef  = useRef(0);
  const phaseRef    = useRef('answering');
  const timerRef    = useRef(null);
  const totalRef    = useRef(quiz.questions.length);

  // Sync refs whenever state changes
  useEffect(() => { answersRef.current  = answers;  }, [answers]);
  useEffect(() => { currentRef.current  = current;  }, [current]);
  useEffect(() => { phaseRef.current    = phase;    }, [phase]);

  const question = quiz.questions[current];
  const total    = quiz.questions.length;

  // ── Submit using ref values (always current) ──────────────
  const submitQuiz = useCallback(async (finalAnswers) => {
    setPhase('submitting');
    phaseRef.current = 'submitting';
    try {
      const { data } = await client.post(`/quiz/${quiz.id}/submit`, { answers: finalAnswers });
      onComplete(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
      setPhase('answering');
      phaseRef.current = 'answering';
    }
  }, [quiz.id, onComplete]);

  // ── Move to the next question only after an answer ────────
  const advance = useCallback((latestAnswers) => {
    const c = currentRef.current;
    const t = totalRef.current;
    if (c < t - 1) {
      const next = c + 1;
      setCurrent(next);
      currentRef.current = next;
      setPhase('answering');
      phaseRef.current = 'answering';
    } else {
      submitQuiz(latestAnswers);
    }
  }, [submitQuiz]);

  // ── Total quiz countdown ─────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (phaseRef.current === 'answering') {
            submitQuiz(answersRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [submitQuiz]);

  // ── User selects an answer ────────────────────────────────
  function handleAnswer(idx) {
    if (phase !== 'answering') return;

    const newAnswers = { ...answersRef.current, [question.id]: idx };
    answersRef.current = newAnswers;      // update ref immediately
    setAnswers(newAnswers);               // then update state for render
  }

  function goNext() {
    if (hasAnswered && phase === 'answering') advance(answersRef.current);
  }

  function goPrevious() {
    if (current > 0 && hasAnswered && phase === 'answering') {
      const previous = current - 1;
      setCurrent(previous);
      currentRef.current = previous;
    }
  }

  // ── Visual helpers ────────────────────────────────────────
  const progress    = ((current + 1) / total) * 100;
  const timerPct    = (timeLeft / totalTime) * 100;
  const timerColor  = timeLeft <= 5 ? '#D32F2F' : timeLeft <= 10 ? '#FF9800' : '#2E7D32';
  const selectedIdx = answers[question?.id];
  const hasAnswered  = selectedIdx !== undefined;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <button className="btn btn-ghost mb-4" onClick={onBack}>← Back</button>

      {/* ── Header: progress bar + timer ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{quiz.title}</span>
            <span>Q {current + 1} / {total} · {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-primary)', borderRadius: 3, transition: 'width .4s ease' }} />
          </div>
        </div>

        {/* Circular timer */}
        <div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: '50%',
          background: `conic-gradient(${timerColor} ${timerPct * 3.6}deg, var(--color-border) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: timerColor }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="card" style={{ padding: '28px 28px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Question {current + 1}
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.45, marginBottom: 28 }}>
          {question?.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question?.options?.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isFading   = hasAnswered && !isSelected;

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={hasAnswered || phase === 'submitting'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(46,125,50,0.07)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-primary)' : isFading ? 'var(--color-text-muted)' : 'var(--color-text)',
                  fontSize: 14, fontWeight: 500, cursor: hasAnswered ? 'default' : 'pointer',
                  opacity: isFading ? 0.55 : 1,
                  textAlign: 'left', width: '100%',
                  transition: 'all .15s ease',
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: isSelected ? '#fff' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {phase === 'submitting' && (
          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>
            <div className="spinner" style={{ display: 'inline-block', marginRight: 8 }} />
            Calculating your score…
          </div>
        )}

        <div className="quiz-question-navigation">
          <button className="btn btn-outline" onClick={goPrevious} disabled={current === 0 || !hasAnswered || phase === 'submitting'}>← Previous</button>
          <button className="btn btn-primary" onClick={goNext} disabled={!hasAnswered || phase === 'submitting'}>
            {current === total - 1 ? 'Submit Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────
function QuizResults({ result, onRetry, onBack }) {
  const { attempt, results, message } = result;
  const pct = Math.round((attempt.score / attempt.totalPoints) * 100);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Hero */}
      <div className="card" style={{
        textAlign: 'center', padding: '36px 28px',
        background: attempt.passed
          ? 'linear-gradient(135deg,rgba(46,125,50,.07),rgba(25,118,210,.04))'
          : 'linear-gradient(135deg,rgba(255,152,0,.06),rgba(211,47,47,.04))',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}>{attempt.passed ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: attempt.passed ? 'var(--color-primary)' : 'var(--color-accent)', marginBottom: 6 }}>
          {attempt.passed ? 'Quiz Passed!' : 'Keep Practicing!'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>{message}</p>

        {/* Score ring */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: `conic-gradient(${attempt.passed ? 'var(--color-primary)' : 'var(--color-accent)'} ${pct * 3.6}deg, var(--color-surface-2) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--color-surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: attempt.passed ? 'var(--color-primary)' : 'var(--color-accent)', lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{attempt.score}/{attempt.totalPoints}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>+{attempt.earnedPoints}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Points Earned</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{results.filter(r => r.correct).length}/{results.length}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Correct</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>{attempt.passed ? '✅' : '❌'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{attempt.passed ? 'Passed' : 'Failed'}</div>
          </div>
        </div>
      </div>

      {/* Answer review */}
      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>Answer Review</div>
        {results.map((r, i) => (
          <div key={i} style={{
            padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
            borderBottom: i < results.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {r.correct
                ? <MdCheckCircle size={20} color="var(--color-primary)" />
                : <MdCancel size={20} color="var(--color-danger)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Q{i + 1}: {r.question}</div>
              {!r.correct && (
                <div style={{ fontSize: 12, color: 'var(--color-danger)', marginBottom: 3 }}>
                  Your answer: {r.userAnswer !== undefined ? String.fromCharCode(65 + r.userAnswer) : 'No answer (timed out)'}
                </div>
              )}
              {r.explanation && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '6px 10px', borderRadius: 6 }}>
                  💡 {r.explanation}
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: r.correct ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0 }}>
              {r.correct ? `+${r.points}` : '0'} pts
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-outline flex-1" onClick={onBack}>← All Quizzes</button>
        <button className="btn btn-primary flex-1" onClick={onRetry}><MdRefresh /> Try Again</button>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────
function LeaderboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/quiz/leaderboard/top')
      .then(r => setData(r.data))
      .catch(() => setData({ leaderboard: [], myRank: null, myPoints: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading text="Loading leaderboard..." />;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      {data.myRank && (
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))',
          border: 'none', color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 44 }}>🏆</div>
            <div>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 2 }}>Your Ranking</div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>#{data.myRank}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 2 }}>Your Points</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{data.myPoints}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="card-title"><MdLeaderboard style={{ marginRight: 8, verticalAlign: 'middle' }} />Top Eco Champions</h3>
        </div>
        {data.leaderboard.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No scores yet — complete a quiz to be first! 🏆
          </div>
        ) : data.leaderboard.map((e, i) => (
          <div key={e.userId} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < data.leaderboard.length - 1 ? '1px solid var(--color-border)' : 'none',
            background: i === 0 ? 'rgba(255,215,0,.04)' : 'transparent',
          }}>
            <span style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, minWidth: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {i < 3 ? medals[i] : `#${e.rank}`}
            </span>
            <div style={{ width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {e.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div>
              {e.badges?.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {e.badges.slice(0, 3).map(() => '🏅').join('')}{e.badges.length > 3 ? ` +${e.badges.length - 3}` : ''}
                </div>
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary)' }}>
              {e.points.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 2 }}>pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function QuizPage() {
  const [tab,        setTab]        = useState('quizzes');
  const [quizzes,    setQuizzes]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [offline,    setOffline]    = useState(!navigator.onLine);
  const [activeQuiz, setActiveQuiz] = useState(null);  // full quiz with questions
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [result,     setResult]     = useState(null);
  const [catFilter,  setCatFilter]  = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const lastStartedId = useRef(null);
  const lastStartedMeta = useRef(null);
  const lastStartedMode = useRef('classic');
  const { refreshUser } = useAuth();

  useEffect(() => {
    const up = () => setOffline(false);
    const dn = () => setOffline(true);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  useEffect(() => {
    const cached = loadCache();
    if (cached) { setQuizzes(cached); setLoading(false); }
    if (!navigator.onLine) { if (!cached) setLoading(false); return; }
    client.get('/quiz')
      .then(r => { const d = r.data.quizzes || []; setQuizzes(d); saveCache(d); })
      .catch(() => { if (!cached) toast.error('Could not load quizzes'); })
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = async (quizMeta, mode = 'classic') => {
    if (quizMeta.isUnlocked === false) {
      toast.error('Complete the previous difficulty level to unlock this quiz.');
      return;
    }

    lastStartedId.current = quizMeta.id;
    lastStartedMeta.current = quizMeta;
    lastStartedMode.current = mode;
    try {
      const { data } = await client.get(`/quiz/${quizMeta.id}`);
      const allQuestions = data.quiz.questions || [];
      let currentUserId = 'guest';
      try { currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id || 'guest'; } catch { /* use guest history */ }
      const historyKey = `ws_quiz_used:${currentUserId}:${quizMeta.id}`;
      let used = [];
      try { used = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { used = []; }
      let available = allQuestions.filter(question => !used.includes(question.id));
      if (available.length < Math.min(5, allQuestions.length)) { used = []; available = allQuestions; }
      const questionLimit = mode === 'sprint' ? 5 : available.length;
      const questions = shuffleArray(available).slice(0, questionLimit);
      localStorage.setItem(historyKey, JSON.stringify([...used, ...questions.map(question => question.id)]));
      const quiz = { ...data.quiz, questions, mode };
      setActiveQuiz(quiz);
      setResult(null);
    } catch {
      if (quizMeta.questions) { setActiveQuiz({ ...quizMeta, questions: shuffleArray(quizMeta.questions || []), mode }); setResult(null); }
      else toast.error('Could not load questions. Check your connection.');
    }
  };

  const onComplete = async (res) => {
    try {
      await refreshUser();
    } catch (err) {
      console.error('Failed to sync user profile after quiz:', err);
    }
    setResult(res);
    setActiveQuiz(null);
  };
  const onRetry = () => {
    if (lastStartedMeta.current) {
      startQuiz(lastStartedMeta.current, lastStartedMode.current);
      return;
    }

    if (lastStartedId.current) {
      const fallbackQuiz = quizzes.find(q => q.id === lastStartedId.current);
      if (fallbackQuiz) startQuiz(fallbackQuiz, lastStartedMode.current);
      else toast.error('Quiz data is unavailable. Please reload the page and try again.');
    }
  };
  const onBack = () => { setActiveQuiz(null); setResult(null); };

  if (activeQuiz) return <div><ActiveQuiz quiz={activeQuiz} mode={activeQuiz.mode} onComplete={onComplete} onBack={onBack} /></div>;
  if (result)     return <div><QuizResults result={result} onRetry={onRetry} onBack={onBack} /></div>;
  if (selectedQuiz) return <GameModePicker quiz={selectedQuiz} onStart={startQuiz} onBack={() => setSelectedQuiz(null)} />;

  const uniqueQuizzes = quizzes.filter((quiz, index, items) => (
    items.findIndex(item => item.title === quiz.title) === index
  ));
  const categories = [...new Set(uniqueQuizzes.map(q => q.category).filter(Boolean))];
  const filtered = uniqueQuizzes.filter(q =>
    (!catFilter  || q.category  === catFilter) &&
    (!diffFilter || q.difficulty === diffFilter)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eco Quiz 🎮</h1>
          <p className="page-subtitle">Test your recycling knowledge, earn points, and climb the leaderboard!</p>
        </div>
        {offline && <span className="badge badge-orange" style={{ padding: '8px 14px', fontSize: 13 }}>📶 Offline</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['quizzes','🎯 Quizzes'],['leaderboard','🏆 Leaderboard']].map(([k, l]) => (
          <button key={k} className={`btn ${tab === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'quizzes' && (
        <>
          {/* Filters */}
          {quizzes.length > 0 && (
            <div className="card mb-4" style={{ padding: '12px 16px' }}>
              <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="form-control" style={{ flex: '0 1 160px' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.replace('_', ' ')}</option>)}
                </select>
                <select className="form-control" style={{ flex: '0 1 150px' }} value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                  <option value="">All Difficulties</option>
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                  <option value="advanced">🟣 Advanced</option>
                  <option value="expert">⚫ Expert</option>
                </select>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{filtered.length} quiz{filtered.length !== 1 ? 'zes' : ''}</span>
              </div>
            </div>
          )}

          {loading ? (
            <PageLoading text="Loading quizzes..." />
          ) : filtered.length === 0 ? (
            <div className="card">
              <EmptyState icon={<span style={{ fontSize: 48 }}>🎮</span>}
                title="No quizzes available"
                message={offline ? 'Connect to internet to load quizzes.' : 'Quizzes are being added — check back soon!'} />
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map(q => <QuizCard key={q.id} quiz={q} onStart={setSelectedQuiz} />)}
            </div>
          )}
        </>
      )}

      {tab === 'leaderboard' && <LeaderboardTab />}
    </div>
  );
}
