import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function MockInterview() {
  const [difficulty, setDifficulty] = useState('Any');
  const [company, setCompany] = useState('All Companies');
  const [problem, setProblem] = useState(null);
  const [approach, setApproach] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [followups, setFollowups] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingFollowup, setLoadingFollowup] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startMock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.startMock(difficulty, company);
      setProblem(res.data.problem);
      setEvaluation('');
      setFollowups('');
      setApproach('');
      setTimer(0);
      setTimerRunning(true);
    } catch (err) {
      setError('❌ Cannot connect to backend!');
    }
    setLoading(false);
  };

  const submitSolution = async () => {
    if (!approach.trim()) {
      setError('Please write your approach!');
      return;
    }
    setLoadingEval(true);
    setTimerRunning(false);
    setError('');
    try {
      const res = await api.evaluateMock(problem.title, approach, Math.floor(timer / 60) || 1);
      setEvaluation(res.data.evaluation);
    } catch (err) {
      setError('❌ Evaluation failed!');
    }
    setLoadingEval(false);
  };

  const getFollowups = async () => {
    if (!approach.trim()) {
      setError('Please write your approach first!');
      return;
    }
    setLoadingFollowup(true);
    setError('');
    try {
      const res = await api.getFollowup(problem.title, approach);
      setFollowups(res.data.followup_questions);
    } catch (err) {
      setError('❌ Failed to get followups!');
    }
    setLoadingFollowup(false);
  };

  const reset = () => {
    setProblem(null);
    setEvaluation('');
    setFollowups('');
    setApproach('');
    setTimer(0);
    setTimerRunning(false);
    setError('');
  };

  const diffColor = { Easy: '#00cc6a', Medium: '#ff9900', Hard: '#ff3366' };
  const timerColor = timer > 2400 ? '#ff3366' : timer > 1800 ? '#ff9900' : '#00ff88';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          🎯 Mock <span style={{ color: '#00ff88' }}>Interview</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Simulate a real Google / Amazon interview!
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff3366', fontSize: 13 }}>
          ❌ {error}
        </div>
      )}

      {!problem ? (
        <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Difficulty</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Any', 'Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    fontWeight: difficulty === d ? 700 : 400,
                    border: `1px solid ${d === 'Easy' ? '#00cc6a' : d === 'Medium' ? '#ff9900' : d === 'Hard' ? '#ff3366' : '#1e2740'}`,
                    color: d === 'Easy' ? '#00cc6a' : d === 'Medium' ? '#ff9900' : d === 'Hard' ? '#ff3366' : '#5a6580',
                    background: difficulty === d ? 'rgba(255,255,255,0.05)' : 'transparent'
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Company</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All Companies', 'Google', 'Amazon', 'Meta', 'Microsoft'].map(c => (
                <button key={c} onClick={() => setCompany(c)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                    border: '1px solid #1e2740',
                    color: company === c ? '#0066ff' : '#5a6580',
                    background: company === c ? 'rgba(0,102,255,0.1)' : 'transparent',
                    fontWeight: company === c ? 700 : 400
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#141926', borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5a6580', marginBottom: 8 }}>📋 How it works:</div>
            {['AI picks a real interview problem', 'Timer starts automatically', 'Write your approach', 'Get AI evaluation with score', 'Answer follow-up questions'].map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: '#a0aec0', marginBottom: 5 }}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          <button onClick={startMock} disabled={loading}
            style={{ width: '100%', padding: '15px', borderRadius: 10, background: '#00ff88', border: 'none', color: '#080b12', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            {loading ? '⏳ Finding problem...' : '🚀 Start Interview!'}
          </button>
        </div>

      ) : (
        <div>
          {/* Problem */}
          <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 22, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: 22 }}>{problem.title}</h2>
              <div style={{ background: '#141926', border: `2px solid ${timerColor}`, borderRadius: 8, padding: '6px 14px', fontFamily: 'monospace', fontSize: 20, color: timerColor, fontWeight: 700 }}>
                ⏱️ {formatTime(timer)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: diffColor[problem.difficulty], fontWeight: 700, background: `${diffColor[problem.difficulty]}20`, padding: '3px 10px', borderRadius: 4, fontSize: 13 }}>
                {problem.difficulty}
              </span>
              <span style={{ color: '#4285F4', fontSize: 13 }}>🏢 {problem.companies || 'General'}</span>
              <span style={{ color: '#5a6580', fontSize: 12 }}>🏷️ {problem.tags}</span>
            </div>
          </div>

          {timer > 2400 && (
            <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 12, color: '#ff3366', fontSize: 13 }}>
              ⚠️ Over 40 minutes! Try to wrap up!
            </div>
          )}

          <textarea value={approach} onChange={e => setApproach(e.target.value)}
            placeholder="Write your approach:&#10;&#10;1. Data structure?&#10;2. Algorithm?&#10;3. Time complexity?&#10;4. Space complexity?&#10;5. Edge cases?"
            rows={10}
            style={{ width: '100%', padding: '16px', borderRadius: 10, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7 }} />

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={submitSolution} disabled={loadingEval}
              style={{ flex: 1, padding: '13px', borderRadius: 8, background: '#00ff88', border: 'none', color: '#080b12', fontWeight: 700, cursor: 'pointer', minWidth: 140 }}>
              {loadingEval ? '⏳ Evaluating...' : '✅ Submit Solution'}
            </button>
            <button onClick={getFollowups} disabled={loadingFollowup}
              style={{ flex: 1, padding: '13px', borderRadius: 8, background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', color: '#ffcc00', fontWeight: 700, cursor: 'pointer', minWidth: 140 }}>
              {loadingFollowup ? '⏳ Loading...' : '❓ Follow-up Questions'}
            </button>
            <button onClick={reset}
              style={{ padding: '13px 20px', borderRadius: 8, background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.2)', color: '#ff3366', fontWeight: 700, cursor: 'pointer' }}>
              🔄 New
            </button>
          </div>

          {evaluation && (
            <div style={{ background: '#0e1420', borderLeft: '4px solid #00ff88', borderRadius: 10, padding: 22, marginBottom: 16, lineHeight: 1.8 }}>
              <div style={{ color: '#00ff88', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>📊 AI Evaluation:</div>
              <div style={{ color: '#ccc', whiteSpace: 'pre-wrap', fontSize: 14 }}>{evaluation}</div>
            </div>
          )}

          {followups && (
            <div style={{ background: '#0e1420', borderLeft: '4px solid #ffcc00', borderRadius: 10, padding: 22, lineHeight: 1.8 }}>
              <div style={{ color: '#ffcc00', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>🎤 Follow-up Questions:</div>
              <div style={{ color: '#ccc', whiteSpace: 'pre-wrap', fontSize: 14 }}>{followups}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}