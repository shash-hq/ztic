import {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Tategaki from '../ui/Tategaki.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const tagRef = useRef(null);
  const h1Ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({defaults: {ease: 'power3.out'}});
    tl.fromTo(
      tagRef.current,
      {opacity: 0, x: -24},
      {opacity: 1, x: 0, duration: 0.6},
      0.2
    )
      .fromTo(
        h1Ref.current,
        {opacity: 0, y: 60},
        {opacity: 1, y: 0, duration: 1.0},
        0.35
      )
      .fromTo(
        searchRef.current,
        {opacity: 0, y: 24},
        {opacity: 1, y: 0, duration: 0.7},
        0.7
      );

    // Parallax on bg
    gsap.to(bgRef.current, {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: {
        trigger: bgRef.current.parentElement,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{minHeight: '90vh', borderBottom: '2px solid #1A1C1A'}}>
      {/* BG */}
      <div className="absolute inset-0 z-0" ref={bgRef}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg,#0a0a0a 0%,#1a0008 50%,#0a0a0a 100%)',
          }}
        />
        {/* Brutalist dot grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Right accent stripe */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 z-10"
        style={{
          background:
            'linear-gradient(to bottom,transparent,#800020,transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-12">
        {/* Tag */}
        <div
          ref={tagRef}
          className="font-headline font-bold text-urushi text-[10px] tracking-[0.35em] uppercase inline-block mb-8 px-3 py-1"
          style={{
            border: '2px solid #800020',
            boxShadow: '2px 2px 0 0 #800020',
          }}>
          Now Live — Season 2025
        </div>

        {/* H1 */}
        <h1
          ref={h1Ref}
          className="font-headline font-black text-white uppercase leading-none mb-14"
          style={{
            fontSize: 'clamp(72px,12vw,180px)',
            lineHeight: 0.82,
            letterSpacing: '-0.03em',
          }}>
          Movies.
          <br />
          <span style={{color: '#800020'}}>Events.</span>
          <br />
          Now.
        </h1>

        {/* Search bar */}
        <div
          ref={searchRef}
          className="flex max-w-2xl"
          style={{border: '2px solid #fff', boxShadow: '6px 6px 0 0 #800020'}}>
          <input
            type="text"
            placeholder="FIND YOUR ARCHIVE..."
            className="flex-1 bg-transparent text-white font-headline font-bold text-lg tracking-[0.1em] uppercase outline-none px-6 py-5"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <button
            onClick={() => navigate('/events')}
            className="font-headline font-black text-white text-sm tracking-[0.2em] uppercase px-10 py-5 transition-colors duration-100"
            style={{
              background: '#800020',
              borderLeft: '2px solid #fff',
            }}
            onMouseEnter={e => (e.target.style.background = '#570013')}
            onMouseLeave={e => (e.target.style.background = '#800020')}>
            Search
          </button>
        </div>
      </div>

      {/* Tategaki accent */}
      <Tategaki
        className="absolute right-14 text-white text-[9px] tracking-[0.55em] opacity-20 hidden lg:block"
        style={{top: '50%', transform: 'translateY(-50%)'}}>
        The Ink-Stained Architect · Est. 2025 · Tokyo–Berlin
      </Tategaki>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-12 flex items-center gap-3 font-headline text-[9px] tracking-[0.3em] uppercase"
        style={{color: 'rgba(255,255,255,0.3)'}}>
        <div
          style={{width: 48, height: 1, background: 'rgba(255,255,255,0.25)'}}
        />
        Scroll to Explore
      </div>
    </section>
  );
}
