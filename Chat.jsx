import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi! 👋 I'm your AI Coach! Ask me anything about DSA, DSA problems, or interview prep!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await client.post('/chat', {
        message: userMsg,
        context: 'interview prep'
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Cannot connect to backend!'
      }]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    "How do I solve Two Sum optimally?",
    "Explain BFS vs DFS simply",
    "What is Dynamic Programming?",
    "How to prepare for interview?",
    "Explain sliding window technique",
    "Most common interview problems?",
    "What is time complexity O(n log n)?",
    "How to solve tree problems?",
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>
          🤖 AI <span style={{ color: '#00ff88' }}>Coach</span>
        </h1>
        <p style={{ color: '#5a6580', fontSize: 14 }}>
          Your personal  interview preparation assistant!
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#5a6580', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Quick Questions:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => setInput(q)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12,
                cursor: 'pointer', border: '1px solid #1e2740',
                color: '#5a6580', background: 'transparent', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ff88'; e.currentTarget.style.color = '#00ff88'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2740'; e.currentTarget.style.color = '#5a6580'; }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', background: '#0e1420',
        border: '1px solid #1e2740', borderRadius: 16,
        padding: 20, marginBottom: 16, display: 'flex',
        flexDirection: 'column', gap: 16
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 10, alignItems: 'flex-start'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'ai'
                ? 'linear-gradient(135deg, #0066ff, #00ff88)'
                : 'linear-gradient(135deg, #ff3366, #ff9900)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14
            }}>
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'ai' ? '#141926' : 'rgba(0,102,255,0.15)',
              border: `1px solid ${msg.role === 'ai' ? '#1e2740' : 'rgba(0,102,255,0.3)'}`,
              borderRadius: msg.role === 'ai' ? '0 12px 12px 12px' : '12px 0 12px 12px',
              padding: '12px 16px', fontSize: 14, lineHeight: 1.7,
              color: msg.role === 'ai' ? '#e8edf5' : '#a8c4ff',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0066ff, #00ff88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>🤖</div>
            <div style={{
              background: '#141926', border: '1px solid #1e2740',
              borderRadius: '0 12px 12px 12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#00ff88',
                    animation: `bounce 1.2s infinite ${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about DSA, problems, interview tips... (Press Enter to send)"
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 10,
            background: '#0e1420', border: '1px solid #1e2740',
            color: '#e8edf5', fontSize: 14, outline: 'none'
          }} />
        <button onClick={sendMessage} disabled={loading}
          style={{
            padding: '14px 28px', borderRadius: 10,
            background: loading ? '#1e2740' : '#00ff88',
            border: 'none', color: '#080b12',
            fontWeight: 700, fontSize: 14, cursor: 'pointer'
          }}>
          {loading ? '...' : '➤ Send'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}