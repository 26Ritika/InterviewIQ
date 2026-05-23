import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:8000' });

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please fill all fields!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await client.post('/auth/register', { username, email, password });
      }
      const form = new FormData();
      form.append('username', username);
      form.append('password', password);
      const res = await client.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#080b12',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />

      <div style={{
        background: '#0e1420', border: '1px solid #1e2740',
        borderRadius: 20, padding: 40, width: '100%',
        maxWidth: 420, position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#e8edf5' }}>
            InterviewIQ <span style={{ color: '#00ff88' }}>AI</span> Coach
          </div>
          <div style={{ fontSize: 12, color: '#5a6580', marginTop: 4 }}>
            AI Powered DSA Interview Prep Platform
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: '#141926',
          borderRadius: 10, padding: 4, marginBottom: 28
        }}>
          {['Login', 'Register'].map((tab, i) => (
            <button key={i}
              onClick={() => { setIsRegister(i === 1); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: isRegister === (i === 1) ? '#00ff88' : 'transparent',
                color: isRegister === (i === 1) ? '#080b12' : '#5a6580',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,51,102,0.1)',
            border: '1px solid rgba(255,51,102,0.3)',
            borderRadius: 8, padding: '10px 14px',
            marginBottom: 16, color: '#ff3366', fontSize: 13
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Username
          </div>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="e.g. john_doe"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: '#141926', border: '1px solid #1e2740',
              color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }} />
        </div>

        {isRegister && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Email
            </div>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="e.g. john@email.com"
              type="email"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                background: '#141926', border: '1px solid #1e2740',
                color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }} />
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Password
          </div>
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: '#141926', border: '1px solid #1e2740',
              color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }} />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: loading ? '#1e2740' : '#00ff88',
            border: 'none', color: '#080b12',
            fontWeight: 800, fontSize: 16, cursor: 'pointer',
            marginBottom: 16, transition: 'all 0.2s'
          }}>
          {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '🔑 Login'}
        </button>

        {/* Quick login */}
        <div style={{
          background: '#141926', borderRadius: 10,
          padding: 14, textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#5a6580', marginBottom: 8 }}>
            Quick demo login:
          </div>
          <button onClick={() => {
            setUsername('admin');
            setPassword('admin123');
          }}
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 12,
              cursor: 'pointer', border: '1px solid #1e2740',
              color: '#00ff88', background: 'transparent'
            }}>
            Use admin / admin123
          </button>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 12, color: '#5a6580'
        }}>
          🚀 Built for Interview Prep
        </div>
      </div>
    </div>
  );
}