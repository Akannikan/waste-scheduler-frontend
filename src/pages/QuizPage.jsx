import { useEffect, useState, useRef } from 'react';
import {
  MdStar, MdTimer, MdEmojiEvents, MdCheckCircle,
  MdCancel, MdLeaderboard, MdRefresh, MdLock,
} from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import client from '../api/client';
import { PageLoading } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────
const DIFF_COLORS = { easy: '#2E7D32', medium: '#FF9800', hard: '#D32F2F' };
const CACHE_KEY = 'wastescheduler_quizzes_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ── Cache helpers ─────────────────────────────────────────────
function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full */ }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

// ── Quiz Card ─────────────────────────────────────────────────
function QuizCard({ quiz, onStart, attempted }) {
  const diffColor = DIFF_COLORS[quiz.difficulty] || '#888';
  return (
    <div
      className="card"
      style={{
        borderTop: `4px solid ${diffColor}`,
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onClick={() => onStart(quiz)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: `${diffColor}18`, color: diffColor, textTransform: 'capitalize' }}>
            {quiz.difficulty}
          </span>
          {quiz.category && (
            <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
              {quiz.category.replace('_', ' ')}
            </span>
          )}
        </div>
        {attempted && <span style={{ fontSize: 18 }} title="Attempted before">🏅</span>}
      </div>

      <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{quiz.title}</h3>
      {quiz.description && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          {quiz.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        <span>❓ {quiz._count?.questions || quiz.questions?.length || 0} questions</span>
        <span>⏱ {quiz.timeLimit}s per question</span>
        <span>⭐ {quiz.points} bonus pts</span>
      </div>

      <button className="btn btn-primary w-full" style={{ fontSize: 14 }}>
        {attempted ? '🔄 Play Again' : '🎯 Start Quiz'}
      </button>
    </div>
  );
}

// ── Active Quiz ───────────────────────────────────────────────
function ActiveQuiz({ quiz, onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);
  const [revealed, setRevealed] = useState(false); // show answer after select
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  const question = quiz.questions[current];
  const total = quiz.questions.length;
  const answered = answers[question?.id] !== undefined;

  // Reset timer each question
  useEffect(() => {
    setTimeLeft(quiz.timeLimit);
    setRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-advance if no answer
          setRevealed(true);
          setTimeout(() => advanceOrSubmit(), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current]);

  function advanceOrSubmit(forcedAnswers) {
    const finalAnswers = forcedAnswers || answers;
    if (current < total - 1) {
      setCurrent(c => c + 1);
    } else {
      submitQuiz(finalAnswers);
    }
  }

  function handleAnswer(idx) {
    if (answered) return;
    clearInterval(timerRef.current);
    const newAnswers = { ...answers, [question.id]: idx };
    setAnswers(newAnswers);
    setRevealed(true);
    // Wait 1.5 seconds to show feedback then advance
    setTimeout(() => advanceOrSubmit(newAnswers), 1500);
  }

  async function submitQuiz(finalAnswers) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await client.post(`/quiz/${quiz.id}/submit`, { answers: finalAnswers });
      onComplete(data);
    } catch (err) {
      toast.error('Failed to submit quiz. Check your connection.');
      setSubmitting(false);
    }
  }

  const pct = ((current + 1) / total) * 100;
  const timerPct = (timeLeft / quiz.timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? 'var(--color-danger)' : timeLeft <= 10 ? 'var(--color-accent)' : 'var(--color-primary)';

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      <button className="btn btn-ghost mb-4" onClick={onBack}>← Back to Quizzes</button>

      {/* Progress + Timer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 5 }}>
            <span style={{ fontWeight: 600 }}>{quiz.title}</span>
            <span>Question {current + 1} / {total}</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-primary)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Timer circle */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${timerColor} ${timerPct * 3.6}deg, var(--color-surface-2) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--color-surface)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: timerColor, lineHeight: 1 }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, lineHeight: 1.4 }}>
          {question?.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question?.options?.map((opt, idx) => {
            let bgColor = 'var(--color-surface)';
            let borderColor = 'var(--color-border)';
            let textColor = 'var(--color-text)';

            if (revealed && answered) {
              // Show which was selected
              if (answers[question.id] === idx) {
                bgColor = 'rgba(46,125,50,0.08)';
                borderColor = 'var(--color-primary)';
                textColor = 'var(--color-primary)';
              } else {
                bgColor = 'transparent';
                borderColor = 'var(--color-border)';
                textColor = 'var(--color-text-muted)';
              }
            } else if (answered && answers[question.id] === idx) {
              bgColor = 'rgba(46,125,50,0.08)';
              borderColor = 'var(--color-primary)';
              textColor = 'var(--color-primary)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  background: bgColor,
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                  opacity: answered && answers[question.id] !== idx ? 0.6 : 1,
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: answers[question.id] === idx ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: answers[question.id] === idx ? '#fff' : 'var(--color-text-muted)',
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

        {submitting && (
          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-text-muted)', fontSize: 14 }}>
            <span className="spinner" style={{ width: 20, height: 20, display: 'inline-block', marginRight: 8 }} />
            Calculating results...
          </div>
        )}
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────
function QuizResults({ result, onRetry, onBack }) {
  const { attempt, results, message } = result;
  const pct = Math.round((attempt.score / attempt.totalPoints) * 100);
  const passed = attempt.passed;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Hero result */}
      <div className="card" style={{
        textAlign: 'center',
        padding: 36,
        background: passed
          ? 'linear-gradient(135deg, rgba(46,125,50,0.08), rgba(25,118,210,0.04))'
          : 'linear-gradient(135deg, rgba(255,152,0,0.06), rgba(211,47,47,0.04))',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{passed ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: passed ? 'var(--color-primary)' : 'var(--color-accent)', marginBottom: 8 }}>
          {passed ? 'Quiz Passed!' : 'Keep Practicing!'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginBottom: 24 }}>{message}</p>

        {/* Score ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: `conic-gradient(${passed ? 'var(--color-primary)' : 'var(--color-accent)'} ${pct * 3.6}deg, var(--color-surface-2) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'var(--color-surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: passed ? 'var(--color-primary)' : 'var(--color-accent)', lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{attempt.score}/{attempt.totalPoints}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>+{attempt.earnedPoints}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Points Earned</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{results.filter(r => r.correct).length}/{results.length}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Correct Answers</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>{passed ? '✅' : '❌'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{passed ? 'Passed (≥60%)' : 'Failed (<60%)'}</div>
          </div>
        </div>
      </div>

      {/* Answer review */}
      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15 }}>
          Answer Review
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {results.map((r, i) => (
            <div key={i} style={{
              padding: '14px 20px',
              borderBottom: i < results.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {r.correct
                  ? <MdCheckCircle size={20} color="var(--color-primary)" />
                  : <MdCancel size={20} color="var(--color-danger)" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  Q{i + 1}: {r.question}
                </div>
                {!r.correct && (
                  <div style={{ fontSize: 12, color: 'var(--color-danger)', marginBottom: 3 }}>
                    Your answer: {r.userAnswer !== undefined ? String.fromCharCode(65 + r.userAnswer) : 'No answer'}
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
      </div>

      <div className="flex gap-3">
        <button className="btn btn-outline flex-1" onClick={onBack}>← All Quizzes</button>
        <button className="btn btn-primary flex-1" onClick={onRetry}>
          <MdRefresh /> Try Again
        </button>
      </div>
    </div>
  );
}

// ── Leaderboard Tab ───────────────────────────────────────────
function LeaderboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/quiz/leaderboard/top')
      .then(r => setData(r.data))
      .catch(() => setData({ leaderboard: [], myRank: null, myPoints: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      {/* My rank card */}
      {data.myRank && (
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          border: 'none', color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 44 }}>🏆</div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Your Ranking</div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>#{data.myRank}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Your Points</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{data.myPoints}</div>
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
            <p>No scores yet. Be the first to complete a quiz!</p>
          </div>
        ) : (
          data.leaderboard.map((entry, i) => (
            <div key={entry.userId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 20px',
              borderBottom: i < data.leaderboard.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: i === 0 ? 'rgba(255,215,0,0.04)' : i === 1 ? 'rgba(192,192,192,0.04)' : 'transparent',
            }}>
              <span style={{ fontSize: i < 3 ? 24 : 14, fontWeight: 700, minWidth: 36, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {i < 3 ? medals[i] : `#${entry.rank}`}
              </span>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16, flexShrink: 0,
              }}>
                {entry.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</div>
                {entry.badges?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {entry.badges.slice(0, 3).map(() => '🏅').join('')}
                    {entry.badges.length > 3 ? ` +${entry.badges.length - 3}` : ''}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary)' }}>
                {entry.points.toLocaleString()}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 2 }}>pts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function QuizPage() {
  const [tab, setTab] = useState('quizzes');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    // Try cache first for instant display
    const cached = loadCache();
    if (cached) { setQuizzes(cached); setLoading(false); }

    if (navigator.onLine) {
      client.get('/quiz')
        .then(r => {
          const data = r.data.quizzes || [];
          setQuizzes(data);
          saveCache(data);
        })
        .catch(() => {
          if (!cached) toast.error('Could not load quizzes. Playing from cache.');
        })
        .finally(() => setLoading(false));
    } else if (!cached) {
      setLoading(false);
    }

    // Load user attempts
    client.get('/quiz/leaderboard/top')
      .then(r => setAttempts(r.data?.leaderboard || []))
      .catch(() => {});
  }, []);

  const categories = [...new Set(quizzes.map(q => q.category).filter(Boolean))];

  const filtered = quizzes.filter(q => {
    if (categoryFilter && q.category !== categoryFilter) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;
    return true;
  });

  const startQuiz = async (quiz) => {
    // Fetch full quiz with questions
    try {
      const { data } = await client.get(`/quiz/${quiz.id}`);
      setActiveQuiz(data.quiz);
      setResult(null);
    } catch {
      // Try starting with cached data
      if (quiz.questions) {
        setActiveQuiz(quiz);
        setResult(null);
      } else {
        toast.error('Could not load quiz questions. Check your connection.');
      }
    }
  };

  const onComplete = (res) => { setResult(res); setActiveQuiz(null); };
  const onRetry = () => { if (result) startQuiz({ id: result.attempt?.quizId, ...activeQuiz }); };
  const onBack = () => { setActiveQuiz(null); setResult(null); };

  // Show active quiz
  if (activeQuiz) {
    return (
      <div>
        <ActiveQuiz quiz={activeQuiz} onComplete={onComplete} onBack={onBack} />
      </div>
    );
  }

  // Show results
  if (result) {
    return (
      <div>
        <QuizResults result={result} onRetry={onRetry} onBack={onBack} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eco Quiz 🎮</h1>
          <p className="page-subtitle">
            Test your recycling knowledge, earn points, and climb the leaderboard!
          </p>
        </div>
        {isOffline && (
          <div className="badge badge-orange" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>
            📶 Offline — using cached quizzes
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['quizzes', '🎯 Quizzes'], ['leaderboard', '🏆 Leaderboard']].map(([key, label]) => (
          <button
            key={key}
            className={`btn ${tab === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(key)}
            style={{ fontWeight: 600 }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && (
        <>
          {/* Filters */}
          {!loading && quizzes.length > 0 && (
            <div className="card mb-4" style={{ padding: '12px 16px' }}>
              <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="form-control"
                  style={{ flex: '0 1 160px' }}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c} style={{ textTransform: 'capitalize' }}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <select
                  className="form-control"
                  style={{ flex: '0 1 150px' }}
                  value={diffFilter}
                  onChange={e => setDiffFilter(e.target.value)}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy 🟢</option>
                  <option value="medium">Medium 🟡</option>
                  <option value="hard">Hard 🔴</option>
                </select>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {filtered.length} quiz{filtered.length !== 1 ? 'zes' : ''}
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <PageLoading />
          ) : filtered.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<MdStar />}
                title="No quizzes available"
                message={isOffline ? 'No cached quizzes. Connect to internet to load quizzes.' : 'Quizzes are being added. Check back soon!'}
              />
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map(q => (
                <QuizCard
                  key={q.id}
                  quiz={q}
                  onStart={startQuiz}
                  attempted={false}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'leaderboard' && <LeaderboardTab />}
    </div>
  );
}
