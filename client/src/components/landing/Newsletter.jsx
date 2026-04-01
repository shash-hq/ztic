import {useRef, useState, useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmit] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.gsap-reveal'),
        {opacity: 0, y: 40},
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {trigger: sectionRef.current, start: 'top 85%'},
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!email) return;
    setSubmit(true);
    setTimeout(() => setSubmit(false), 3000);
    setEmail('');
  };

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center text-center px-12 py-28"
      style={{background: '#1A1C1A'}}>
      <h2
        className="gsap-reveal font-headline font-black text-white uppercase"
        style={{
          fontSize: 'clamp(48px,9vw,120px)',
          lineHeight: 0.86,
          letterSpacing: '-0.03em',
          marginBottom: 40,
        }}>
        The Ink-Stained
        <br />
        <span style={{color: '#800020'}}>Newsletter.</span>
      </h2>

      <p
        className="gsap-reveal font-body text-sm leading-relaxed max-w-lg mb-12"
        style={{color: 'rgba(255,255,255,0.45)'}}>
        Join the collective for early access to curated cinematic experiences,
        avant-garde comedy, and structural events. Zero friction. Maximum
        aesthetic.
      </p>

      {submitted ? (
        <div
          className="gsap-reveal font-headline font-black text-white text-xl tracking-widest uppercase px-12 py-6"
          style={{
            border: '2px solid #800020',
            boxShadow: '4px 4px 0 0 #800020',
          }}>
          ✓ 購読完了 — Subscribed.
        </div>
      ) : (
        <form
          className="gsap-reveal flex flex-col md:flex-row w-full max-w-xl"
          style={{border: '2px solid #fff', boxShadow: '6px 6px 0 0 #800020'}}
          onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="EMAIL_ADDRESS"
            className="flex-1 font-headline font-bold text-white text-sm tracking-[0.15em] uppercase outline-none px-8 py-5"
            style={{
              background: 'transparent',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          />
          <button
            type="submit"
            className="font-headline font-black text-sumi text-sm tracking-[0.2em] uppercase px-10 py-5 transition-all duration-100"
            style={{background: '#fff', borderLeft: '2px solid #fff'}}
            onMouseEnter={e => {
              e.target.style.background = '#800020';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#fff';
              e.target.style.color = '#1A1C1A';
            }}>
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
