import {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import BentoCard from './BentoCard.jsx';
import {fetchEvents} from '../../services/eventService.js';
import {useCursorShadow} from '../../hooks/useCursorShadow.js';

gsap.registerPlugin(ScrollTrigger);

const VARIANTS = ['image', 'text', 'image', 'feature', 'dark'];

export default function BentoGrid() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  useCursorShadow('.bento-card');

  useEffect(() => {
    fetchEvents({trending: true})
      .then(res => setEvents(res.data?.slice(0, 5) ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Scroll reveals
  useEffect(() => {
    if (!events.length) return;
    const ctx = gsap.context(() => {
      // Header lines
      gsap.fromTo(
        headerRef.current.querySelectorAll('.gsap-reveal'),
        {opacity: 0, y: 40},
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {trigger: headerRef.current, start: 'top 85%'},
        }
      );
      // Cards stagger
      gsap.fromTo(
        gridRef.current.querySelectorAll('.bento-card'),
        {opacity: 0, y: 32, scale: 0.95},
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {trigger: gridRef.current, start: 'top 85%'},
        }
      );
    });
    return () => ctx.revert();
  }, [events]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(3, 280px)',
    gap: 20,
  };

  const spans = [
    {gridColumn: 'span 8', gridRow: 'span 2'},
    {gridColumn: 'span 4', gridRow: 'span 1'},
    {gridColumn: 'span 4', gridRow: 'span 1'},
    {gridColumn: 'span 5', gridRow: 'span 2'},
    {gridColumn: 'span 7', gridRow: 'span 1'},
  ];

  return (
    <section className="px-12 py-24" style={{background: '#FAF9F6'}}>
      {/* Header */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span
            className="gsap-reveal font-headline font-bold text-[10px] tracking-[0.35em] uppercase text-white inline-block px-3 py-1 mb-5"
            style={{background: '#800020'}}>
            Trending Now
          </span>
          <h2
            className="gsap-reveal font-headline font-black uppercase"
            style={{
              fontSize: 'clamp(44px,7vw,88px)',
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
            }}>
            The Curated
            <br />
            Collection
          </h2>
        </div>
        <p className="gsap-reveal font-body text-sm leading-relaxed opacity-60 max-w-xs text-right">
          A selection of high-contrast cultural moments. Hand-picked for the
          architect of experiences.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="font-headline font-black text-2xl opacity-20 py-24 text-center tracking-widest">
          LOADING COLLECTION...
        </div>
      ) : (
        <div ref={gridRef} style={gridStyle}>
          {events.map((event, i) => (
            <BentoCard
              key={event._id}
              event={event}
              variant={VARIANTS[i] ?? 'image'}
              style={spans[i] ?? {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}
