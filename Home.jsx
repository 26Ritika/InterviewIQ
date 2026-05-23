import { useState } from 'react';
import { api } from '../api/client';

export default function Home() {
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState('All Companies');
  const [difficulty, setDifficulty] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) {
      setError('Please enter a search query!');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await api.search(query, company);
      let results = res.data.results;

      // Remove duplicates
      const seen = new Set();
      results = results.filter(p => {
        if (seen.has(p.title)) return false;
        seen.add(p.title);
        return true;
      });

      // Filter by difficulty
      if (difficulty !== 'All') {
        results = results.filter(p => p.difficulty === difficulty);
      }

      setResults(results);
    } catch (err) {
      setError('❌ Cannot connect to backend! Make sure it is running.');
    }
    setLoading(false);
  };

  const diffColor = {
    Easy: '#00cc6a',
    Medium: '#ff9900',
    Hard: '#ff3366'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          🔍 Find <span style={{ color: '#00ff88' }}>Problems</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Search using natural language — AI finds the best matching problems!
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Company
          </div>
          <select value={company} onChange={e => setCompany(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none' }}>
            {['All Companies', 'Google', 'Amazon', 'Meta', 'Microsoft'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Difficulty
          </div>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0e1420', border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. find two numbers that add to target..."
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 10,
            background: '#0e1420', border: '1px solid #1e2740',
            color: '#e8edf5', fontSize: 14, outline: 'none',
            transition: 'border-color 0.2s'
          }} />
        <button onClick={search} disabled={loading}
          style={{
            padding: '14px 28px', borderRadius: 10,
            background: loading ? '#1e2740' : '#00ff88',
            border: 'none', color: '#080b12',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s', minWidth: 120
          }}>
          {loading ? '⏳ Searching...' : '🔍 Search'}
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 24 }}>
        💡 Try: "find two numbers", "longest substring", "binary search tree"
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16,
          color: '#ff3366', fontSize: 13
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#5a6580' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div>No problems found! Try a different query.</div>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: '#5a6580', marginBottom: 12 }}>
            Found <span style={{ color: '#00ff88', fontWeight: 700 }}>{results.length}</span> problems
          </div>

          {results.map((p, i) => (
            <div key={i} style={{
              background: '#0e1420', border: '1px solid #1e2740',
              borderRadius: 12, padding: 18, marginBottom: 10,
              transition: 'border-color 0.2s', cursor: 'pointer'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00ff88'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2740'}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</span>
                <span style={{
                  color: diffColor[p.difficulty], fontSize: 11,
                  fontWeight: 700, background: `${diffColor[p.difficulty]}20`,
                  padding: '4px 10px', borderRadius: 4
                }}>
                  {p.difficulty}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <span style={{ color: '#4285F4' }}>🏢 {p.companies || 'General'}</span>
                <span style={{ color: '#5a6580' }}>🏷️ {p.tags || 'DSA'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Find Your Next Problem
          </div>
          <div style={{ color: '#5a6580', fontSize: 14 }}>
            Search by describing the problem in plain English!
          </div>
        </div>
      )}
    </div>
  );
}