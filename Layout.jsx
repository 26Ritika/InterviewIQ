import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '🔍', label: 'Find Problems' },
  { path: '/hint', icon: '💡', label: 'Hint Engine' },
  { path: '/complexity', icon: '⚡', label: 'Complexity' },
  { path: '/pattern', icon: '🌿', label: 'Pattern' },
  { path: '/review', icon: '👨‍💻', label: 'Code Review' },
  { path: '/mock', icon: '🎯', label: 'Mock Interview' },
  { path: '/progress', icon: '📊', label: 'Progress' },
  { path: '/chat', icon: '🤖', label: 'AI Coach', badge: 'NEW' },
];

export default function Layout() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#080b12', color: '#e8edf5',
      fontFamily: 'sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0e1420',
        borderRight: '1px solid #1e2740',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'fixed',
        top: 0, bottom: 0, left: 0, zIndex: 100
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2740' }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            InterviewIQ <span style={{ color: '#00ff88' }}>AI</span> Coach
          </div>
          <div style={{ fontSize: 10, color: '#5a6580', marginTop: 4 }}>
            // Interview Prep 🚀
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, marginBottom: 2,
                textDecoration: 'none',
                background: isActive ? 'rgba(0,255,136,0.08)' : 'transparent',
                color: isActive ? '#00ff88' : '#5a6580',
                border: isActive ? '1px solid rgba(0,255,136,0.15)' : '1px solid transparent',
                transition: 'all 0.2s'
              })}>
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, background: '#ff3366',
                  color: 'white', padding: '2px 6px',
                  borderRadius: 10, fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: 14, borderTop: '1px solid #1e2740' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', background: '#141926',
            borderRadius: 10, marginBottom: 8
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0066ff, #00ff88)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13,
              fontWeight: 800, color: '#080b12', flexShrink: 0
            }}>
              {username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{username}</div>
              <div style={{ fontSize: 10, color: '#ffcc00' }}>⭐ Pro User</div>
            </div>
          </div>
          <button onClick={logout}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              background: 'rgba(255,51,102,0.1)',
              border: '1px solid rgba(255,51,102,0.2)',
              color: '#ff3366', cursor: 'pointer',
              fontSize: 13, fontWeight: 600
            }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', marginLeft: 220 }}>
        <Outlet />
      </main>
    </div>
  );
}