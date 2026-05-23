import { useState } from 'react';
import { api } from '../api/client';

export default function Complexity() {
  const [problem, setProblem] = useState('');
  const [approach, setApproach] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!problem.trim() || !approach.trim()) {
      setError('Please fill both fields!');
      return;
    }
    setLoading(true);
    setError('');
    setAnalysis('');
    try {
      const res = await api.analyzeComplexity(problem, approach);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError('❌ Cannot connect to backend!');
    }
    setLoading(false);
  };

  const examples = [
    { problem: 'Two Sum', approach: 'I will use two nested for loops to check all pairs' },
    { problem: 'Binary Search', approach: 'I will divide array in half each time' },
    { problem: 'Merge Sort', approach: 'I will recursively split and merge arrays' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          ⚡ Complexity <span style={{ color: '#00ff88' }}>Analyzer</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Get instant Big-O analysis of your approach!
        </p>
      </div>

      {/* Examples */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Try an example:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {examples.map((ex, i) => (
            <button key={i}
              onClick={() => { setProblem(ex.problem); setApproach(ex.approach); }}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12,
                cursor: 'pointer', border: '1px solid #1e2740',
                color: '#5a6580', background: 'transparent',
              }}>
              {ex.problem}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Problem Name
        </div>
        <input value={problem} onChange={e => setProblem(e.target.value)}
          placeholder="e.g. Two Sum"
          style={{ width: '100%', padding: '14px 18px', borderRadius: 10, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Approach Input */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Your Approach
        </div>
        <textarea value={approach} onChange={e => setApproach(e.target.value)}
          placeholder="e.g. I will use two nested loops to check every pair of numbers..."
          rows={5}
          style={{ width: '100%', padding: '14px 18px', borderRadius: 10, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }} />
      </div>

      <button onClick={analyze} disabled={loading}
        style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading ? '#1e2740' : '#00ff88', border: 'none', color: '#080b12', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 24 }}>
        {loading ? '⏳ Analyzing...' : '⚡ Analyze Complexity'}
      </button>

      {error && (
        <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff3366', fontSize: 13 }}>
          {error}
        </div>
      )}

      {analysis && (
        <div style={{ background: '#0e1420', borderLeft: '4px solid #ff9900', borderRadius: 10, padding: 24, lineHeight: 1.8 }}>
          <div style={{ color: '#ff9900', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
            ⚡ Analysis for "{problem}":
          </div>
          <div style={{ color: '#ccc', fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {analysis}
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5a6580' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#e8edf5' }}>Analyze Your Approach</div>
          <div style={{ fontSize: 13 }}>Describe your solution and get instant Big-O analysis!</div>
        </div>
      )}
    </div>
  );
}