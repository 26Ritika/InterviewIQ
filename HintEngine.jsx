import { useState } from 'react';
import { api } from '../api/client';

export default function HintEngine() {
  const [problem, setProblem] = useState('');
  const [level, setLevel] = useState(1);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getHint = async () => {
    if (!problem.trim()) {
      setError('Please enter a problem name!');
      return;
    }
    setLoading(true);
    setError('');
    setHint('');
    try {
      const res = await api.getHint(problem, level);
      setHint(res.data.hint);
    } catch (err) {
      setError('❌ Cannot connect to backend!');
    }
    setLoading(false);
  };

  const levels = [
    { id: 1, label: '💡 Vague', desc: 'Just a small nudge', color: '#00cc6a' },
    { id: 2, label: '🔦 Medium', desc: 'Data structure hint', color: '#ff9900' },
    { id: 3, label: '🔍 Specific', desc: 'Step by step approach', color: '#ff3366' },
  ];

  const popularProblems = [
    'Two Sum', 'Longest Substring',
    'Number of Islands', 'Trapping Rain Water',
    'LRU Cache', 'Merge Intervals'
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          💡 Hint <span style={{ color: '#00ff88' }}>Engine</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Get AI hints without spoiling the answer!
        </p>
      </div>

      {/* Problem Input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Problem Name
        </div>
        <input
          value={problem}
          onChange={e => setProblem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && getHint()}
          placeholder="e.g. Two Sum, Number of Islands..."
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 10,
            background: '#0e1420', border: '1px solid #1e2740',
            color: '#e8edf5', fontSize: 14, outline: 'none',
            boxSizing: 'border-box'
          }} />
      </div>

      {/* Popular Problems */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8 }}>
          Popular:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {popularProblems.map(p => (
            <button key={p} onClick={() => setProblem(p)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12,
                cursor: 'pointer', border: '1px solid #1e2740',
                color: '#5a6580', background: 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#1e2740'; e.target.style.color = '#5a6580'; }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Hint Level */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Hint Level
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {levels.map(l => (
            <button key={l.id} onClick={() => setLevel(l.id)}
              style={{
                padding: '14px 10px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${level === l.id ? l.color : '#1e2740'}`,
                color: level === l.id ? l.color : '#5a6580',
                background: level === l.id ? `${l.color}15` : 'transparent',
                transition: 'all 0.2s', textAlign: 'center'
              }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{l.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Get Hint Button */}
      <button onClick={getHint} disabled={loading}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          background: loading ? '#1e2740' : '#00ff88',
          border: 'none', color: '#080b12',
          fontWeight: 800, fontSize: 15, cursor: 'pointer',
          marginBottom: 24, transition: 'all 0.2s'
        }}>
        {loading ? '⏳ Getting hint...' : '💡 Get Hint'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,51,102,0.1)',
          border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: 8, padding: '12px 16px',
          marginBottom: 16, color: '#ff3366', fontSize: 13
        }}>
          {error}
        </div>
      )}

      {/* Hint Result */}
      {hint && (
        <div style={{
          background: '#0e1420',
          borderLeft: `4px solid ${levels[level - 1].color}`,
          borderRadius: 10, padding: 24, lineHeight: 1.8
        }}>
          <div style={{ color: levels[level - 1].color, fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
            {levels[level - 1].label} Hint for "{problem}":
          </div>
          <div style={{ color: '#ccc', fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {hint}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e2740' }}>
            <div style={{ fontSize: 12, color: '#5a6580', marginBottom: 8 }}>
              Want more detail?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {levels.filter(l => l.id !== level).map(l => (
                <button key={l.id} onClick={() => { setLevel(l.id); setHint(''); }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12,
                    cursor: 'pointer', border: `1px solid ${l.color}`,
                    color: l.color, background: 'transparent'
                  }}>
                  Try {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hint && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5a6580' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>💡</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#e8edf5' }}>
            Stuck on a problem?
          </div>
          <div style={{ fontSize: 13 }}>
            Enter a problem name and get AI hints without spoiling the solution!
          </div>
        </div>
      )}
    </div>
  );
}