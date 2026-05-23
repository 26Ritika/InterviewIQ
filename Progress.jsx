import { useState, useEffect } from 'react';
import { api } from '../api/client';

function StreakCalendar({ recent }) {
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  const activeDates = new Set((recent || []).map(r => r.solved_at?.slice(0, 10)));
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 8 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div key={di} title={day}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: activeDates.has(day) ? '#00ff88' : '#1e2740',
                  cursor: 'pointer', transition: 'transform 0.1s'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.5)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#5a6580' }}>Less</span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {['#1e2740', '#00aa55', '#00cc66', '#00ff88'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#5a6580' }}>More</span>
      </div>
    </div>
  );
}

function CompanyStats({ stats }) {
  const companies = [
    { name: 'Google', color: '#4285F4', count: stats?.google || 0 },
    { name: 'Amazon', color: '#FF9900', count: stats?.amazon || 0 },
    { name: 'Meta', color: '#0866FF', count: stats?.meta || 0 },
    { name: 'Microsoft', color: '#00A4EF', count: stats?.microsoft || 0 },
  ];
  const max = Math.max(...companies.map(c => c.count), 1);
  return (
    <div>
      {companies.map((c, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: c.color, fontWeight: 700 }}>{c.name}</span>
            <span style={{ color: '#5a6580' }}>{c.count} solved</span>
          </div>
          <div style={{ height: 8, background: '#141926', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(c.count / max) * 100}%`,
              background: c.color, borderRadius: 4, transition: 'width 1s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [company, setCompany] = useState('Google');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getStats();
      setStats(statsRes.data);
      const lbRes = await api.getLeaderboard();
      setLeaderboard(lbRes.data.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const markSolved = async () => {
    if (!title.trim()) return;
    try {
      await api.markSolved(title, difficulty, company);
      setSuccess(`✅ ${title} marked as solved!`);
      setTitle('');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const diffColor = { Easy: '#00cc6a', Medium: '#ff9900', Hard: '#ff3366' };
  const rankEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#5a6580' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
      <div>Loading your progress...</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          📊 Your <span style={{ color: '#00ff88' }}>Progress</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Track your interview preparation journey!
        </p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Solved', value: stats.total_solved, color: '#00ff88' },
            { label: 'Day Streak 🔥', value: stats.streak, color: '#ffcc00' },
            { label: 'Today', value: stats.today_solved, color: '#0066ff' },
            { label: 'Mock Interviews', value: stats.mock_interviews, color: '#ff3366' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#0e1420', border: '1px solid #1e2740',
              borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 4, fontWeight: 800, fontSize: 16 }}>🔥 Activity Calendar</h3>
        <p style={{ color: '#5a6580', fontSize: 12, marginBottom: 16 }}>Like GitHub contributions!</p>
        <StreakCalendar recent={stats?.recent || []} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>📊 Difficulty</h3>
          {stats && [
            { label: 'Easy', val: stats.easy, total: 148, color: '#00cc6a' },
            { label: 'Medium', val: stats.medium, total: 150, color: '#ff9900' },
            { label: 'Hard', val: stats.hard, total: 50, color: '#ff3366' },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#5a6580' }}>{p.label}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>{p.val}/{p.total}</span>
              </div>
              <div style={{ height: 8, background: '#141926', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((p.val / p.total) * 100, 100)}%`,
                  background: p.color, borderRadius: 4, transition: 'width 1s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>🏢 Company Stats</h3>
          <CompanyStats stats={stats} />
        </div>
      </div>

      <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>✅ Mark Problem As Solved</h3>
        {success && (
          <div style={{
            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 8, padding: '10px 16px', marginBottom: 12, color: '#00ff88', fontSize: 13
          }}>
            {success}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Problem name e.g. Two Sum"
            onKeyDown={e => e.key === 'Enter' && markSolved()}
            style={{
              flex: 1, minWidth: 200, padding: '10px 14px',
              borderRadius: 8, background: '#141926',
              border: '1px solid #1e2740', color: '#e8edf5', fontSize: 14, outline: 'none'
            }} />
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            style={{ padding: '10px', borderRadius: 8, background: '#141926', border: '1px solid #1e2740', color: '#e8edf5' }}>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={company} onChange={e => setCompany(e.target.value)}
            style={{ padding: '10px', borderRadius: 8, background: '#141926', border: '1px solid #1e2740', color: '#e8edf5' }}>
            {['Google', 'Amazon', 'Meta', 'Microsoft'].map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={markSolved}
            style={{
              padding: '10px 20px', borderRadius: 8, background: '#00ff88',
              border: 'none', color: '#080b12', fontWeight: 700, cursor: 'pointer'
            }}>
            ✅ Mark Solved
          </button>
        </div>

        {stats?.recent?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 12, color: '#5a6580', fontSize: 13 }}>🕐 Recent Activity</h4>
            {[...new Map(stats.recent.map(i => [
              `${i.title}_${i.solved_at?.slice(0, 10)}`, i
            ])).values()].slice(0, 10).map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: '#141926',
                border: '1px solid #1e2740', borderRadius: 8, marginBottom: 6
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</span>
                <span style={{ color: diffColor[item.difficulty], fontSize: 12 }}>[{item.difficulty}]</span>
                <span style={{ color: '#5a6580', fontSize: 11 }}>{item.solved_at?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#0e1420', border: '1px solid #1e2740', borderRadius: 16, padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: 16 }}>🏆 Leaderboard</h3>
        {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', background: '#141926',
            border: '1px solid #1e2740', borderRadius: 8, marginBottom: 6
          }}>
            <span style={{ fontSize: 20 }}>{rankEmoji[entry.rank] || `#${entry.rank}`}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{entry.username}</span>
            <span style={{ color: '#5a6580', fontSize: 12 }}>{entry.problems_solved} solved</span>
            <span style={{ color: '#00ff88', fontSize: 12, fontFamily: 'monospace' }}>{entry.total_score} pts</span>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: '#5a6580', padding: 20 }}>
            No leaderboard data yet! Start solving! 💪
          </div>
        )}
      </div>
    </div>
  );
}