import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Tategaki from '../components/ui/Tategaki.jsx';
import {fetchEvents} from '../services/eventService.js';
import {formatDate} from '../utils/formatters.js';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  {value: '', label: 'All'},
  {value: 'cinema', label: 'Cinema'},
  {value: 'event', label: 'Events'},
  {value: 'comedy', label: 'Comedy'},
];

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') ?? '';
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  const loadEvents = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    fetchEvents(params)
      .then(res => setEvents(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Header animation — runs once
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current.querySelectorAll('.gsap-reveal'),
        {opacity: 0, y: 32},
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.1,
        }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Grid stagger on data change
  useEffect(() => {
    if (loading || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current.querySelectorAll('.event-card'),
        {opacity: 0, y: 28, scale: 0.96},
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power3.out',
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [loading, events]);

  const setCategory = val => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set('category', val);
    else p.delete('category');
    setSearchParams(p);
  };

  const filtered = events.filter(
    e => !search || e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main style={{minHeight: '100vh', background: '#FAF9F6'}}>
        {/* Page header */}
        <div
          ref={headerRef}
          style={{
            background: '#1A1C1A',
            borderBottom: '2px solid #1A1C1A',
            padding: 'clamp(40px,5vw,80px) clamp(20px,4vw,64px)',
            position: 'relative',
            overflow: 'hidden',
          }}>
          {/* Grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),' +
                'linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
              backgroundSize: '70px 70px',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 1200,
              margin: '0 auto',
            }}>
            <div className="gsap-reveal" style={{marginBottom: 16}}>
              <span
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
                }}>
                Full Archive
              </span>
            </div>

            <h1
              className="gsap-reveal"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(52px,9vw,120px)',
                lineHeight: 0.86,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
                marginBottom: 40,
              }}>
              All
              <br />
              <span style={{color: '#800020'}}>Sessions.</span>
            </h1>

            {/* Search + Filter bar */}
            <div
              className="gsap-reveal"
              style={{
                display: 'flex',
                gap: 0,
                border: '2px solid rgba(255,255,255,0.2)',
                maxWidth: 680,
                flexWrap: 'wrap',
              }}>
              <input
                type="text"
                placeholder="SEARCH ARCHIVE..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  padding: '14px 20px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              />
              {CATEGORIES.map(({value, label}) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '14px 20px',
                    border: 'none',
                    borderLeft: '2px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                    background:
                      activeCategory === value ? '#800020' : 'transparent',
                    color: '#fff',
                    transition: 'background 0.12s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tategaki */}
          <Tategaki
            className="font-headline font-black text-[9px] tracking-[0.5em]"
            style={{
              position: 'absolute',
              right: 28,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.1)',
            }}>
            ZTic_Event_Archive_2025
          </Tategaki>
        </div>

        {/* Event count bar */}
        <div
          style={{
            borderBottom: '2px solid #1A1C1A',
            padding: '12px clamp(20px,4vw,64px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F4F3F1',
          }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              opacity: 0.45,
            }}>
            {loading
              ? 'Loading...'
              : `${filtered.length} Session${filtered.length !== 1 ? 's' : ''} Found`}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              opacity: 0.3,
            }}>
            Sorted by: Latest
          </span>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(32px,4vw,64px) clamp(20px,4vw,64px)',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(min(100%,320px), 1fr))',
            gap: 24,
          }}>
          {loading ? (
            Array.from({length: 6}).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length > 0 ? (
            filtered.map(event => (
              <EventCard key={event._id} event={event} navigate={navigate} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Event Card ────────────────────────────────────────
function EventCard({event, navigate}) {
  const [hovered, setHovered] = useState(false);
  const firstShow = event.shows?.[0];

  const handleClick = () => {
    if (firstShow) {
      navigate(`/events/${event.slug}/shows/${firstShow._id ?? firstShow}`);
    }
  };

  return (
    <div
      className="event-card"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '2px solid #1A1C1A',
        boxShadow: hovered ? '2px 2px 0 0 #1A1C1A' : '4px 4px 0 0 #1A1C1A',
        transform: hovered ? 'translate(2px,2px)' : 'translate(0,0)',
        transition: 'box-shadow 0.1s ease, transform 0.1s ease',
        background: '#FAF9F6',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Image */}
      <div
        style={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
        <img
          src={event.heroImage}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: hovered
              ? 'grayscale(0) contrast(1.05)'
              : 'grayscale(1) contrast(1.15)',
            transition: 'filter 0.55s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top,rgba(10,10,10,0.75) 0%,transparent 55%)',
          }}
        />
        {/* Category badge */}
        <div style={{position: 'absolute', top: 12, left: 12}}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              background: '#800020',
              color: '#fff',
              padding: '3px 10px',
              border: '2px solid #1A1C1A',
            }}>
            {event.category}
          </span>
        </div>
        {/* Trending tag */}
        {event.isTrending && (
          <div style={{position: 'absolute', top: 12, right: 12}}>
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: '#1A1C1A',
                color: '#fff',
                padding: '3px 10px',
              }}>
              Trending
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '20px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 12,
        }}>
        <div>
          <p
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              opacity: 0.45,
              marginBottom: 6,
            }}>
            {event.location}
          </p>
          <h3
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              lineHeight: 0.95,
              color: '#1A1C1A',
            }}>
            {event.title}
          </h3>
        </div>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 12,
            lineHeight: 1.7,
            opacity: 0.55,
            flex: 1,
          }}>
          {event.description}
        </p>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
            paddingTop: 14,
            borderTop: '1px solid rgba(26,28,26,0.08)',
          }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.45,
            }}>
            {firstShow ? formatDate(firstShow.date) : 'TBA'}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: hovered ? '#800020' : '#1A1C1A',
              transition: 'color 0.12s',
            }}>
            {firstShow?.availableSeats > 0 ? 'Book Now →' : 'Sold Out'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        border: '2px solid #E3E2E0',
        boxShadow: '4px 4px 0 0 #E3E2E0',
        background: '#F4F3F1',
        overflow: 'hidden',
      }}>
      <div
        style={{
          height: 200,
          background: '#E3E2E0',
          animation: 'pulse 1.8s ease infinite',
        }}
      />
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
        <div style={{height: 10, width: '40%', background: '#E3E2E0'}} />
        <div style={{height: 22, width: '80%', background: '#E3E2E0'}} />
        <div style={{height: 10, width: '100%', background: '#E3E2E0'}} />
        <div style={{height: 10, width: '70%', background: '#E3E2E0'}} />
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '80px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          marginBottom: 16,
        }}>
        <div
          style={{width: 80, height: 3, background: '#1A1C1A', opacity: 0.15}}
        />
        <div
          style={{
            width: 48,
            height: 3,
            background: '#800020',
            opacity: 0.4,
            alignSelf: 'flex-end',
          }}
        />
      </div>
      <h3
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          fontSize: 28,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          opacity: 0.3,
        }}>
        No Sessions Found.
      </h3>
      <p
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 13,
          opacity: 0.35,
        }}>
        Try a different search term or category.
      </p>
    </div>
  );
}
