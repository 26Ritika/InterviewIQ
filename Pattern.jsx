import { useState } from 'react';
import { api } from '../api/client';

export default function Pattern() {
  const [problem, setProblem] = useState('');
  const [pattern, setPattern] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detect = async () => {
    if (!problem.trim()) {
      setError('Please enter a problem name!');
      return;
    }
    setLoading(true);
    setError('');
    setPattern('');
    try {
      const res = await api.getPattern(problem);
      setPattern(res.data.pattern);
    } catch (err) {
      setError('❌ Cannot connect to backend!');
    }
    setLoading(false);
  };

  const commonPatterns = [
    { name: 'Sliding Window', icon: '🪟', example: 'Longest Substring' },
    { name: 'Two Pointers', icon: '👆', example: 'Trapping Rain Water' },
    { name: 'BFS/DFS', icon: '🌊', example: 'Number of Islands' },
    { name: 'Dynamic Programming', icon: '📊', example: 'Climbing Stairs' },
    { name: 'Binary Search', icon: '🔍', example: 'Search Rotated Array' },
    { name: 'HashMap', icon: '🗺️', example: 'Two Sum' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          🌿 Pattern <span style={{ color: '#00ff88' }}>Detector</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Identify the right DSA pattern for any problem!
        </p>
      </div>

      {/* Common Patterns */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Common Patterns — Click to detect:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {commonPatterns.map((p, i) => (
            <button key={i} onClick={() => setProblem(p.example)}
              style={{
                padding: '10px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid #1e2740', color: '#e8edf5',
                background: '#0e1420', textAlign: 'left', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7B61FF'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2740'}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: '#5a6580', marginTop: 2 }}>{p.example}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Problem Name
        </div>
        <input value={problem} onChange={e => setProblem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && detect()}
          placeholder="e.g. Number of Islands, Two Sum..."
          style={{ width: '100%', padding: '14px 18px', borderRadius: 10, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <button onClick={detect} disabled={loading}
        style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading ? '#1e2740' : '#00ff88', border: 'none', color: '#080b12', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 24 }}>
        {loading ? '⏳ Detecting...' : '🌿 Detect Pattern'}
      </button>

      {error && (
        <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff3366', fontSize: 13 }}>
          {error}
        </div>
      )}

      {pattern && (
        <div style={{ background: '#0e1420', borderLeft: '4px solid #7B61FF', borderRadius: 10, padding: 24, lineHeight: 1.8 }}>
          <div style={{ color: '#7B61FF', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
            🌿 Pattern for "{problem}":
          </div>
          <div style={{ color: '#ccc', fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {pattern}
          </div>
        </div>
      )}

      {!pattern && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5a6580' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>🌿</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#e8edf5' }}>Detect Algorithm Pattern</div>
          <div style={{ fontSize: 13 }}>Enter any LeetCode problem and find the right pattern!</div>
        </div>
      )}
    </div>
  );
}