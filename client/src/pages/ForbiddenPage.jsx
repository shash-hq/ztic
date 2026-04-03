import {useNavigate} from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1A1C1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(32px,6vw,96px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div style={{position: 'relative', zIndex: 1}}>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            background: '#800020',
            color: '#fff',
            padding: '4px 12px',
            display: 'inline-block',
            marginBottom: 28,
            boxShadow: '2px 2px 0 0 #800020',
          }}>
          Error_403
        </span>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(80px,16vw,200px)',
            lineHeight: 0.8,
            letterSpacing: '-0.04em',
            color: '#fff',
            marginBottom: 0,
          }}>
          403
        </h1>
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(24px,4vw,52px)',
            lineHeight: 0.9,
            letterSpacing: '-0.025em',
            textTransform: 'uppercase',
            color: '#800020',
            marginBottom: 28,
          }}>
          Access
          <br />
          Denied.
        </h2>
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 13,
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.4)',
            maxWidth: 400,
            marginBottom: 44,
          }}>
          Your role does not have permission to access this section of the
          archive.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: '#fff',
            color: '#1A1C1A',
            border: '2px solid #fff',
            padding: '16px 40px',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 0 #800020',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translate(2px,2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0,0)';
            e.currentTarget.style.boxShadow = '4px 4px 0 0 #800020';
          }}>
          ← Return Home
        </button>
      </div>
    </div>
  );
}
