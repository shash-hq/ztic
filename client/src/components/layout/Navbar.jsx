import {NavLink, useNavigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth.js';
import Tategaki from '../ui/Tategaki.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const {user, isAuthenticated, logout} = useAuth();

  const navLinkStyle = ({isActive}) => ({
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    padding: '4px 8px',
    transition: 'all 0.1s',
    color: isActive ? '#800020' : '#1A1C1A',
    opacity: isActive ? 1 : 0.55,
    borderBottom: isActive ? '2px solid #800020' : '2px solid transparent',
  });

  const iconBtnStyle = {
    fontSize: 18,
    padding: '6px 8px',
    color: '#1A1C1A',
    transition: 'all 0.1s',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 40px',
        background: 'rgba(250,249,246,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '2px solid #1A1C1A',
      }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#1A1C1A',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}>
        ZTic
        <span style={{opacity: 0.3, margin: '0 8px'}}>—</span>
        <span style={{opacity: 0.45, fontSize: 11}}>
          Cinema | Events | Comedy
        </span>
      </button>

      {/* Centre links */}
      <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
        {[
          {label: 'Cinema', to: '/?category=cinema'},
          {label: 'Events', to: '/events'},
          {label: 'Comedy', to: '/?category=comedy'},
        ].map(({label, to}) => (
          <NavLink
            key={label}
            to={to}
            style={navLinkStyle}
            onMouseEnter={e => {
              if (!e.currentTarget.style.borderBottomColor.includes('800020')) {
                e.currentTarget.style.background = '#800020';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '';
              e.currentTarget.style.opacity = '';
            }}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right — auth state */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        {isAuthenticated ? (
          <>
            {/* Role badge */}
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                background: user?.role === 'organizer' ? '#1A1C1A' : '#F4F3F1',
                color:
                  user?.role === 'organizer' ? '#fff' : 'rgba(26,28,26,0.5)',
                padding: '3px 8px',
                border: '2px solid #1A1C1A',
              }}>
              {user?.role}
            </span>

            {/* My Bookings */}
            <button
              onClick={() => navigate('/my-bookings')}
              style={iconBtnStyle}
              title="My Bookings"
              onMouseEnter={e => {
                e.currentTarget.style.background = '#800020';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#1A1C1A';
              }}>
              ◈
            </button>

            {/* Organizer portal shortcut */}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <button
                onClick={() => navigate('/organizer')}
                style={{
                  ...iconBtnStyle,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '6px 10px',
                  border: '2px solid #1A1C1A',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1A1C1A';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#1A1C1A';
                }}>
                Portal
              </button>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              style={iconBtnStyle}
              title="Logout"
              onMouseEnter={e => {
                e.currentTarget.style.background = '#800020';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#1A1C1A';
              }}>
              ⊗
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '8px 16px',
                border: '2px solid #1A1C1A',
                background: 'none',
                color: '#1A1C1A',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1A1C1A';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#1A1C1A';
              }}>
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '8px 16px',
                border: '2px solid #1A1C1A',
                background: '#800020',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 0 #1A1C1A',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#570013';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#800020';
              }}>
              Register →
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
