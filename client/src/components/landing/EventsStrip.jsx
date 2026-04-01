import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {fetchEvents} from '../../services/eventService.js';
import {formatDate} from '../../utils/formatters.js';

gsap.registerPlugin(ScrollTrigger);

export default function EventsStrip() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents()
      .then(res => setEvents(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.event-row'),
        {opacity: 0, x: -32},
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {trigger: sectionRef.current, start: 'top 85%'},
        }
      );
    });
    return () => ctx.revert();
  }, [events]);

  const handleRowClick = event => {
    const firstShow = event.shows?.[0];
    if (firstShow) {
      navigate(`/events/${event.slug}/shows/${firstShow._id ?? firstShow}`);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="px-12 py-24"
      style={{background: '#F4F3F1'}}>
      <span
        className="font-headline font-bold text-[10px] tracking-[0.35em] uppercase text-white inline-block px-3 py-1 mb-5"
        style={{background: '#800020'}}>
        On Sale Now
      </span>
      <h2
        className="font-headline font-black uppercase mb-12"
        style={{
          fontSize: 'clamp(44px,7vw,88px)',
          lineHeight: 0.88,
          letterSpacing: '-0.03em',
        }}>
        Upcoming
        <br />
        Sessions
      </h2>

      {loading ? (
        <div className="font-headline font-black text-xl opacity-20 tracking-widest py-16 text-center">
          LOADING SESSIONS...
        </div>
      ) : (
        <div style={{borderTop: '2px solid #1A1C1A'}}>
          {events.map((event, i) => (
            <EventRow
              key={event._id}
              event={event}
              index={i}
              onClick={() => handleRowClick(event)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EventRow({event, index, onClick}) {
  const firstShow = event.shows?.[0];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="event-row flex items-center justify-between gap-5 px-8 py-6 cursor-pointer"
      style={{
        borderBottom: '2px solid #1A1C1A',
        background: hovered ? '#800020' : '#FAF9F6',
        transition: 'background 0.12s ease',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <span
        className="font-headline font-black text-[11px] tracking-[0.1em]"
        style={{
          opacity: hovered ? 0.6 : 0.25,
          color: hovered ? '#fff' : '#1A1C1A',
          minWidth: 32,
        }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <span
        className="font-headline font-bold text-[10px] tracking-[0.25em] uppercase"
        style={{
          opacity: hovered ? 0.8 : 0.45,
          color: hovered ? '#fff' : '#1A1C1A',
          minWidth: 110,
        }}>
        {firstShow ? formatDate(firstShow.date) : 'TBA'}
      </span>

      <span
        className="font-headline font-black uppercase flex-1"
        style={{
          fontSize: 'clamp(16px,2.2vw,24px)',
          letterSpacing: '-0.01em',
          color: hovered ? '#fff' : '#1A1C1A',
        }}>
        {event.title}
      </span>

      <span
        className="font-body text-[11px] tracking-[0.2em] uppercase"
        style={{
          opacity: hovered ? 0.7 : 0.4,
          color: hovered ? '#fff' : '#1A1C1A',
          minWidth: 130,
        }}>
        {event.location}
      </span>

      <button
        className="font-headline font-bold text-[9px] tracking-[0.3em] uppercase px-4 py-2"
        style={{
          border: `2px solid ${hovered ? '#fff' : '#1A1C1A'}`,
          background: 'none',
          color: hovered ? '#fff' : '#1A1C1A',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        onClick={e => {
          e.stopPropagation();
          onClick();
        }}>
        Get Ticket
      </button>
    </div>
  );
}
