import {useNavigate} from 'react-router-dom';
import {useEffect, useRef} from 'react';
import gsap from 'gsap';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Tategaki from '../components/ui/Tategaki.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const blockRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        blockRef.current.querySelectorAll('.gsap-reveal'),
        {opacity: 0, y: 40},
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: 'power3.out',
          delay: 0.1,
        }
      );
      // Glitch flicker on the 404
      gsap.fromTo(
        '#glitch-num',
        {x: -4},
        {x: 4, duration: 0.07, repeat: 6, yoyo: true, ease: 'none', delay: 0.6}
      );
    }, blockRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
      <main
        ref={blockRef}
        style={{
          minHeight: '90vh',
          background: '#1A1C1A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'clamp(32px,6vw,96px)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '2px solid #1A1C1A',
        }}>
        {/* Grid overlay */}
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

        {/* Accent stripe */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background:
              'linear-gradient(to bottom,transparent,#800020,transparent)',
          }}
        />

        <div style={{position: 'relative', zIndex: 1}}>
          <div
            className="gsap-reveal"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              background: '#800020',
              color: '#fff',
              padding: '4px 12px',
              display: 'inline-block',
              boxShadow: '2px 2px 0 0 #800020',
              marginBottom: 32,
            }}>
            Error_404
          </div>

          <h1
            id="glitch-num"
            className="gsap-reveal"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(120px,22vw,280px)',
              lineHeight: 0.8,
              letterSpacing: '-0.04em',
              color: '#fff',
              marginBottom: 0,
            }}>
            404
          </h1>

          <h2
            className="gsap-reveal"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(28px,5vw,64px)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
              textTransform: 'uppercase',
              color: '#800020',
              marginBottom: 32,
            }}>
            Page Not
            <br />
            Found.
          </h2>

          <p
            className="gsap-reveal"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 13,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 420,
              marginBottom: 48,
            }}>
            The blueprint for this page does not exist in the archive. The
            architect may have moved it, or it was never built.
          </p>

          <div
            className="gsap-reveal"
            style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
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
            <button
              onClick={() => navigate('/events')}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.3)',
                padding: '16px 40px',
                cursor: 'pointer',
                transition: 'border-color 0.12s',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.borderColor = '#800020')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')
              }>
              Browse Events →
            </button>
          </div>
        </div>

        {/* Tategaki right accent */}
        <Tategaki
          className="font-headline font-black text-[9px] tracking-[0.5em]"
          style={{
            position: 'absolute',
            right: 28,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.08)',
          }}>
          ZTic_Page_Not_Found_404
        </Tategaki>
      </main>
      <Footer />
    </>
  );
}
