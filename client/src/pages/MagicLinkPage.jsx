import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {verifyMagicLink} from '../services/authService.js';
import {useAuth} from '../hooks/useAuth.js';

export default function MagicLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {login} = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token provided in the link.');
      return;
    }

    verifyMagicLink(token)
      .then(res => {
        login(res.data.accessToken, res.data.user);
        navigate('/', {replace: true});
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.message);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1A1C1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }}>
      <div
        style={{
          background: '#FAF9F6',
          border: '2px solid #1A1C1A',
          boxShadow: '6px 6px 0 0 #800020',
          padding: '48px 56px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
        {status === 'verifying' ? (
          <>
            <div
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
                marginBottom: 24,
              }}>
              Verifying
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 32,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#1A1C1A',
                lineHeight: 0.9,
              }}>
              Unlocking
              <br />
              <span style={{color: '#800020'}}>The Archive.</span>
            </h2>
          </>
        ) : (
          <>
            <div
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
                marginBottom: 24,
              }}>
              Link Expired
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#1A1C1A',
                marginBottom: 16,
                lineHeight: 0.9,
              }}>
              Link
              <br />
              <span style={{color: '#800020'}}>Invalid.</span>
            </h2>
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 12,
                opacity: 0.55,
                marginBottom: 32,
                lineHeight: 1.7,
              }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                background: '#1A1C1A',
                color: '#fff',
                border: '2px solid #1A1C1A',
                padding: '14px 32px',
                cursor: 'pointer',
                boxShadow: '4px 4px 0 0 #800020',
              }}>
              Request New Link →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
