import {useState, useEffect} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import {sendOtp, verifyOtp} from '../services/authService.js';
import {useAuth} from '../hooks/useAuth.js';
import Tategaki from '../components/ui/Tategaki.jsx';

const CHANNELS = [
  {value: 'email', label: 'Email'},
  {value: 'sms', label: 'SMS'},
  {value: 'whatsapp', label: 'WhatsApp'},
];

// ── Design tokens (inline — no dependency on external UI lib) ─────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#1A1C1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(24px,4vw,64px)',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),' +
      'linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
    backgroundSize: '70px 70px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: '#FAF9F6',
    border: '2px solid #1A1C1A',
    boxShadow: '6px 6px 0 0 #800020',
    padding: 'clamp(32px,5vw,56px)',
    width: '100%',
    maxWidth: 480,
  },
  tag: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    background: '#800020',
    color: '#fff',
    padding: '4px 12px',
    display: 'inline-block',
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(36px,6vw,56px)',
    lineHeight: 0.88,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: '#1A1C1A',
    marginBottom: 8,
  },
  sub: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 12,
    lineHeight: 1.7,
    color: 'rgba(26,28,26,0.5)',
    marginBottom: 36,
  },
  label: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'rgba(26,28,26,0.5)',
    display: 'block',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    background: '#fff',
    border: '2px solid #1A1C1A',
    outline: 'none',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '0.05em',
    color: '#1A1C1A',
    padding: '14px 16px',
    marginBottom: 20,
    boxSizing: 'border-box',
    transition: 'box-shadow 0.1s',
  },
  inputFocus: {boxShadow: '3px 3px 0 0 #800020'},
  channelRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  channelBtn: active => ({
    flex: 1,
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    padding: '10px 4px',
    border: '2px solid #1A1C1A',
    background: active ? '#1A1C1A' : '#FAF9F6',
    color: active ? '#fff' : '#1A1C1A',
    cursor: 'pointer',
    transition: 'background 0.1s, color 0.1s',
  }),
  btn: disabled => ({
    width: '100%',
    background: disabled ? '#E3E2E0' : '#1A1C1A',
    color: '#fff',
    border: '2px solid #1A1C1A',
    padding: '18px 0',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '4px 4px 0 0 #800020',
    transition: 'transform 0.1s, box-shadow 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  }),
  error: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#800020',
    background: 'rgba(128,0,32,0.06)',
    border: '2px solid rgba(128,0,32,0.25)',
    padding: '10px 14px',
    marginBottom: 20,
  },
  otpGrid: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    flex: 1,
    textAlign: 'center',
    background: '#fff',
    border: '2px solid #1A1C1A',
    outline: 'none',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 22,
    color: '#1A1C1A',
    padding: '12px 0',
    transition: 'box-shadow 0.1s',
  },
  divider: {
    borderTop: '1px solid rgba(26,28,26,0.1)',
    margin: '28px 0',
  },
  link: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#800020',
    textDecoration: 'none',
    borderBottom: '2px solid rgba(128,0,32,0.3)',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {login, isAuthenticated} = useAuth();

  const from = location.state?.from?.pathname ?? '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate(from, {replace: true});
  }, [isAuthenticated]);

  // ── Step machine: 'contact' | 'otp' ──────────────────────────────────────
  const [step, setStep] = useState('contact');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async e => {
    e?.preventDefault();
    setError('');
    if (!contact.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(contact.trim(), channel);
      setStep('otp');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit input handlers ──────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async e => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(contact.trim(), code);
      login(res.data.accessToken, res.data.user);
      navigate(from, {replace: true});
    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const pressStyle = {
    onMouseEnter: e => {
      if (!loading) {
        e.currentTarget.style.transform = 'translate(2px,2px)';
        e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'translate(0,0)';
      e.currentTarget.style.boxShadow = '4px 4px 0 0 #800020';
    },
  };

  return (
    <div style={S.page}>
      <div style={S.grid} />

      {/* Tategaki accent */}
      <Tategaki
        className="font-headline font-black text-[9px] tracking-[0.5em]"
        style={{
          position: 'absolute',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.08)',
        }}>
        ZTic_Sign_In_Portal
      </Tategaki>

      <div style={S.card}>
        {/* Header */}
        <span style={S.tag}>
          {step === 'contact' ? 'Sign In / Register' : 'Verify Identity'}
        </span>

        <h1 style={S.heading}>
          {step === 'contact' ? (
            <>
              The
              <br />
              <span style={{color: '#800020'}}>Archive.</span>
            </>
          ) : (
            <>
              Enter
              <br />
              <span style={{color: '#800020'}}>Code.</span>
            </>
          )}
        </h1>

        <p style={S.sub}>
          {step === 'contact'
            ? 'No passwords. Enter your email or phone — we send you a code.'
            : `A 6-digit code was sent to ${contact} via ${channel}. Expires in 10 minutes.`}
        </p>

        {/* Error */}
        {error && <div style={S.error}>{error}</div>}

        {/* ── Step 1: Contact + Channel ─────────────────────────────────── */}
        {step === 'contact' && (
          <form onSubmit={handleSendOtp}>
            {/* Channel selector */}
            <span style={S.label}>Delivery Channel</span>
            <div style={S.channelRow}>
              {CHANNELS.map(({value, label}) => (
                <button
                  key={value}
                  type="button"
                  style={S.channelBtn(channel === value)}
                  onClick={() => setChannel(value)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Contact input */}
            <label style={S.label} htmlFor="contact">
              {channel === 'email' ? 'Email Address' : 'Phone Number (E.164)'}
            </label>
            <input
              id="contact"
              type={channel === 'email' ? 'email' : 'tel'}
              placeholder={
                channel === 'email' ? 'you@example.com' : '+919876543210'
              }
              value={contact}
              onChange={e => setContact(e.target.value)}
              style={{
                ...S.input,
                ...(focused === 'contact' ? S.inputFocus : {}),
              }}
              onFocus={() => setFocused('contact')}
              onBlur={() => setFocused(null)}
              autoComplete="email"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !contact.trim()}
              style={S.btn(loading || !contact.trim())}
              {...(!loading && contact.trim() ? pressStyle : {})}>
              {loading ? 'Sending...' : 'Send Code →'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP Entry ─────────────────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            {/* 6-digit OTP grid */}
            <div style={S.otpGrid} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onFocus={() => setFocused(`otp-${i}`)}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...S.otpInput,
                    ...(focused === `otp-${i}` ? S.inputFocus : {}),
                    boxShadow: digit
                      ? '3px 3px 0 0 #800020'
                      : focused === `otp-${i}`
                        ? '3px 3px 0 0 #1A1C1A'
                        : 'none',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              style={S.btn(loading || otp.join('').length < 6)}
              {...(!loading && otp.join('').length === 6 ? pressStyle : {})}>
              {loading ? 'Verifying...' : 'Confirm Identity →'}
            </button>

            <div style={S.divider} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  ...S.link,
                  opacity: resendCooldown > 0 ? 0.4 : 1,
                  pointerEvents: resendCooldown > 0 ? 'none' : 'auto',
                }}
                onClick={handleSendOtp}>
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'}
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  ...S.link,
                }}
                onClick={() => {
                  setStep('contact');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}>
                ← Change Contact
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={{...S.divider, marginTop: 32}} />
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 11,
            opacity: 0.4,
            textAlign: 'center',
          }}>
          New here? Signing in automatically creates your account.{' '}
          <Link to="/" style={S.link}>
            Browse events instead →
          </Link>
        </p>
      </div>
    </div>
  );
}
