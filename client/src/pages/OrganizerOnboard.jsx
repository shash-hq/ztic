import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {registerTenant} from '../services/tenantService.js';
import {useTenantStore} from '../store/tenantStore.js';
import {useAuthStore} from '../store/authStore.js';
import Tategaki from '../components/ui/Tategaki.jsx';
import Navbar from '../components/layout/Navbar.jsx';

// ── Inline design tokens ──────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#FAF9F6',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
  },
  body: {
    maxWidth: 840,
    margin: '0 auto',
    padding: 'clamp(40px,5vw,80px) clamp(20px,4vw,64px)',
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
    fontSize: 'clamp(40px,7vw,88px)',
    lineHeight: 0.88,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: '#1A1C1A',
    marginBottom: 12,
  },
  sub: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 13,
    lineHeight: 1.75,
    color: 'rgba(26,28,26,0.5)',
    maxWidth: 520,
    marginBottom: 56,
  },
  card: {
    border: '2px solid #1A1C1A',
    boxShadow: '4px 4px 0 0 #1A1C1A',
    background: '#fff',
    padding: 'clamp(28px,4vw,48px)',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#1A1C1A',
    marginBottom: 28,
    paddingBottom: 12,
    borderBottom: '2px solid #1A1C1A',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sectionNum: {
    background: '#800020',
    color: '#fff',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 10,
    fontWeight: 900,
    padding: '2px 8px',
  },
  fieldGroup: {marginBottom: 24},
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
  required: {color: '#800020', marginLeft: 4},
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '2px solid #1A1C1A',
    outline: 'none',
    background: '#FAF9F6',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 600,
    fontSize: 15,
    color: '#1A1C1A',
    padding: '12px 14px',
    transition: 'box-shadow 0.1s',
  },
  inputFocused: {boxShadow: '3px 3px 0 0 #800020', background: '#fff'},
  hint: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 11,
    opacity: 0.4,
    marginTop: 6,
    lineHeight: 1.5,
  },
  row2: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20},
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 14,
    marginTop: 8,
  },
  planCard: (active, disabled) => ({
    border: `2px solid ${active ? '#800020' : '#1A1C1A'}`,
    boxShadow: active ? '3px 3px 0 0 #800020' : 'none',
    background: active ? '#800020' : '#FAF9F6',
    color: active ? '#fff' : '#1A1C1A',
    padding: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'all 0.1s',
    textAlign: 'left',
  }),
  planName: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  },
  planDesc: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
  },
  error: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#800020',
    background: 'rgba(128,0,32,0.06)',
    border: '2px solid rgba(128,0,32,0.25)',
    padding: '12px 16px',
    marginBottom: 24,
  },
  submitBtn: disabled => ({
    width: '100%',
    background: disabled ? '#E3E2E0' : '#1A1C1A',
    color: '#fff',
    border: '2px solid #1A1C1A',
    padding: '20px 0',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '4px 4px 0 0 #800020',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    transition: 'transform 0.1s, box-shadow 0.1s',
  }),
};

const PLANS = [
  {
    value: 'free',
    name: 'Free',
    desc: 'Up to 2 active events. Core ticketing. ZTic branding.',
    locked: false,
  },
  {
    value: 'growth',
    name: 'Growth',
    desc: 'Unlimited events. Custom branding. Analytics dashboard.',
    locked: true,
  },
  {
    value: 'enterprise',
    name: 'Enterprise',
    desc: 'White-label domain. Priority support. SLA guarantees.',
    locked: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrganizerOnboard() {
  const navigate = useNavigate();
  const setTenant = useTenantStore(s => s.setTenant);
  const updateUser = useAuthStore(s => s.updateUser);
  const user = useAuthStore(s => s.user);

  // Redirect if already an organiser
  useEffect(() => {
    if (user?.role === 'organizer' || user?.role === 'admin') {
      navigate('/organizer', {replace: true});
    }
  }, [user]);

  const [form, setForm] = useState({
    orgName: '',
    contactEmail: user?.email ?? '',
    contactPhone: user?.phone ?? '',
    institution: '',
    plan: 'free',
  });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const inputStyle = id => ({
    ...S.input,
    ...(focused === id ? S.inputFocused : {}),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.orgName.trim()) {
      setError('Organisation name is required.');
      return;
    }
    if (!form.contactEmail.trim()) {
      setError('Contact email is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerTenant(form);
      setTenant(res.data);
      // Update local auth store to reflect role promotion
      updateUser({role: 'organizer', tenantId: res.data._id});
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <>
        <Navbar />
        <div style={S.page}>
          <div
            style={{
              ...S.body,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
            <span style={S.tag}>Registration Complete</span>
            <h1 style={S.heading}>
              Organisation
              <br />
              <span style={{color: '#800020'}}>Registered.</span>
            </h1>
            <p style={S.sub}>
              Your organiser account is active. Head to the portal to create
              your first event.
            </p>
            <div
              style={{
                border: '2px solid #1A1C1A',
                boxShadow: '4px 4px 0 0 #800020',
                background: '#1A1C1A',
                padding: '40px 48px',
                marginBottom: 32,
                maxWidth: 520,
                width: '100%',
              }}>
              {/* Hanko stamp */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  border: '3px solid #800020',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 28,
                  transform: 'rotate(-4deg)',
                }}>
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 900,
                    fontSize: 8,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#800020',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}>
                  ZTic
                  <br />
                  認証済
                  <br />
                  VERIFIED
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 6,
                }}>
                Organisation
              </p>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  marginBottom: 24,
                }}>
                {form.orgName}
              </p>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 6,
                }}>
                Plan
              </p>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#800020',
                }}>
                {form.plan.toUpperCase()} TIER
              </p>
            </div>
            <button
              onClick={() => navigate('/organizer')}
              style={{
                ...S.submitBtn(false),
                width: 'auto',
                padding: '18px 48px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(2px,2px)';
                e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0,0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 0 #800020';
              }}>
              Enter Organiser Portal →
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Onboarding form ───────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div style={S.page}>
        <div style={{position: 'relative'}}>
          {/* Tategaki side accent */}
          <Tategaki
            className="font-headline font-black text-[9px] tracking-[0.5em]"
            style={{
              position: 'fixed',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(26,28,26,0.07)',
              pointerEvents: 'none',
            }}>
            ZTic_Organiser_Onboarding_Portal
          </Tategaki>

          <div style={S.body}>
            {/* Header */}
            <span style={S.tag}>Organiser Onboarding</span>
            <h1 style={S.heading}>
              Register Your
              <br />
              <span style={{color: '#800020'}}>Organisation.</span>
            </h1>
            <p style={S.sub}>
              Set up your ticketing organisation in under 2 minutes. No
              contracts, no setup fees. Start on the free tier and scale when
              you need to.
            </p>

            {error && <div style={S.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* ── Section 1: Organisation Details ─────────────────────── */}
              <div style={S.card}>
                <div style={S.sectionTitle}>
                  <span style={S.sectionNum}>01</span>
                  Organisation Details
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="orgName">
                    Organisation Name <span style={S.required}>*</span>
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    placeholder="IIT Bombay Techfest · Mood Indigo · etc."
                    value={form.orgName}
                    onChange={e => set('orgName', e.target.value)}
                    style={inputStyle('orgName')}
                    onFocus={() => setFocused('orgName')}
                    onBlur={() => setFocused(null)}
                    autoFocus
                  />
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="institution">
                    Institution / University
                  </label>
                  <input
                    id="institution"
                    type="text"
                    placeholder="IIT Bombay · NIT Trichy · Independent"
                    value={form.institution}
                    onChange={e => set('institution', e.target.value)}
                    style={inputStyle('institution')}
                    onFocus={() => setFocused('institution')}
                    onBlur={() => setFocused(null)}
                  />
                  <p style={S.hint}>
                    Leave blank if you are an independent event organiser.
                  </p>
                </div>
              </div>

              {/* ── Section 2: Contact ───────────────────────────────────── */}
              <div style={S.card}>
                <div style={S.sectionTitle}>
                  <span style={S.sectionNum}>02</span>
                  Contact Information
                </div>

                <div style={{...S.row2}}>
                  <div style={S.fieldGroup}>
                    <label style={S.label} htmlFor="contactEmail">
                      Contact Email <span style={S.required}>*</span>
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      placeholder="events@yourdomain.com"
                      value={form.contactEmail}
                      onChange={e => set('contactEmail', e.target.value)}
                      style={inputStyle('contactEmail')}
                      onFocus={() => setFocused('contactEmail')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label} htmlFor="contactPhone">
                      Contact Phone
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      placeholder="+919876543210"
                      value={form.contactPhone}
                      onChange={e => set('contactPhone', e.target.value)}
                      style={inputStyle('contactPhone')}
                      onFocus={() => setFocused('contactPhone')}
                      onBlur={() => setFocused(null)}
                    />
                    <p style={S.hint}>
                      E.164 format. Used for WhatsApp OTP alerts.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Plan ──────────────────────────────────────── */}
              <div style={S.card}>
                <div style={S.sectionTitle}>
                  <span style={S.sectionNum}>03</span>
                  Select Plan
                </div>

                <div style={S.planGrid}>
                  {PLANS.map(({value, name, desc, locked}) => (
                    <button
                      key={value}
                      type="button"
                      disabled={locked}
                      style={S.planCard(form.plan === value, locked)}
                      onClick={() => !locked && set('plan', value)}>
                      <span style={S.planName}>{name}</span>
                      {locked && (
                        <span
                          style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 8,
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            background: 'rgba(26,28,26,0.15)',
                            padding: '2px 6px',
                            display: 'inline-block',
                            marginBottom: 6,
                          }}>
                          Coming Soon
                        </span>
                      )}
                      <p
                        style={{
                          ...S.planDesc,
                          color:
                            form.plan === value
                              ? 'rgba(255,255,255,0.75)'
                              : 'rgba(26,28,26,0.5)',
                        }}>
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Submit ───────────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={loading}
                style={S.submitBtn(loading)}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translate(2px,2px)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0,0)';
                  e.currentTarget.style.boxShadow = loading
                    ? 'none'
                    : '4px 4px 0 0 #800020';
                }}>
                {loading
                  ? 'Registering Organisation...'
                  : 'Register Organisation →'}
              </button>

              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 11,
                  opacity: 0.35,
                  textAlign: 'center',
                  marginTop: 20,
                  lineHeight: 1.6,
                }}>
                By registering, you agree to ZTic's Organiser Terms of Service.
                Your account is immediately active on the Free plan.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
