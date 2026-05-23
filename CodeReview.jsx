import { useState } from 'react';
import { api } from '../api/client';

export default function CodeReview() {
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getReview = async () => {
    if (!problem.trim() || !code.trim()) {
      setError('Please fill both fields!');
      return;
    }
    setLoading(true);
    setError('');
    setReview('');
    try {
      const res = await api.reviewCode(problem, code);
      setReview(res.data.review);
    } catch (err) {
      setError('❌ Cannot connect to backend!');
    }
    setLoading(false);
  };

  const sampleCode = `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          👨‍💻 Code <span style={{ color: '#00ff88' }}>Review</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Get AI feedback on your code like a real interviewer!
        </p>
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

      {/* Code Input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#5a6580', textTransform: 'uppercase', letterSpacing: 1 }}>
            Your Code
          </div>
          <button onClick={() => { setProblem('Two Sum'); setCode(sampleCode); }}
            style={{ fontSize: 11, color: '#00ff88', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Load Sample Code
          </button>
        </div>
        <textarea value={code} onChange={e => setCode(e.target.value)}
          placeholder="Paste your solution here..."
          rows={12}
          style={{ width: '100%', padding: '14px 18px', borderRadius: 10, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} />
      </div>

      <button onClick={getReview} disabled={loading}
        style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading ? '#1e2740' : '#00ff88', border: 'none', color: '#080b12', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 24 }}>
        {loading ? '⏳ Reviewing...' : '👨‍💻 Review My Code'}
      </button>

      {error && (
        <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff3366', fontSize: 13 }}>
          {error}
        </div>
      )}

      {review && (
        <div style={{ background: '#0e1420', borderLeft: '4px solid #00ff88', borderRadius: 10, padding: 24, lineHeight: 1.8 }}>
          <div style={{ color: '#00ff88', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
            👨‍💻 Code Review for "{problem}":
          </div>
          <div style={{ color: '#ccc', fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {review}
          </div>
        </div>
      )}

      {!review && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5a6580' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>👨‍💻</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#e8edf5' }}>Get Code Review</div>
          <div style={{ fontSize: 13 }}>Paste your code and get feedback like a real Google interviewer!</div>
        </div>
      )}
    </div>
  );
}