import {useNavigate} from 'react-router-dom';
import HankoStamp from '../ui/HankoStamp.jsx';
import Tategaki from '../ui/Tategaki.jsx';

export default function BentoCard({
  event,
  variant = 'image',
  style = {},
  className = '',
}) {
  const navigate = useNavigate();
  const firstShow = event?.shows?.[0];

  const handleClick = () => {
    if (firstShow) {
      navigate(`/events/${event.slug}/shows/${firstShow._id}`);
    }
  };

  const base = {
    border: '2px solid #1A1C1A',
    boxShadow: '4px 4px 0px 0px #1A1C1A',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    background: '#FAF9F6',
    transition: 'box-shadow 0.1s ease, transform 0.1s ease',
  };

  const hoverEnter = e => {
    e.currentTarget.style.boxShadow = '2px 2px 0px 0px #1A1C1A';
    e.currentTarget.style.transform = 'translate(2px,2px)';
  };
  const hoverLeave = e => {
    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #1A1C1A';
    e.currentTarget.style.transform = 'translate(0,0)';
  };

  /* ── Image variant ───────────────────────── */
  if (variant === 'image') {
    return (
      <div
        className={`group bento-card ${className}`}
        style={{...base, ...style}}
        onClick={handleClick}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}>
        <img
          src={event.heroImage}
          alt={event.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) contrast(1.15)',
            transition: 'filter 0.65s ease',
          }}
          onMouseEnter={e =>
            (e.target.style.filter = 'grayscale(0) contrast(1.05)')
          }
          onMouseLeave={e =>
            (e.target.style.filter = 'grayscale(1) contrast(1.15)')
          }
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top,rgba(10,10,10,0.9) 0%,transparent 55%)',
          }}
        />

        {/* Tag */}
        {event.tags?.[0] && (
          <div style={{position: 'absolute', top: 16, left: 16}}>
            <span
              className="font-headline font-bold text-white text-[9px] tracking-[0.3em] uppercase px-3 py-1"
              style={{background: '#800020', border: '2px solid #1A1C1A'}}>
              {event.tags[0]}
            </span>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
          }}>
          <div
            className="font-mono text-[9px] tracking-[0.3em] uppercase mb-2"
            style={{color: 'rgba(255,255,255,0.5)'}}>
            {event.location}
          </div>
          <h3
            className="font-headline font-black text-white uppercase"
            style={{
              fontSize: 'clamp(22px,3vw,42px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
            }}>
            {event.title}
          </h3>
        </div>

        {/* Tategaki strip */}
        <div
          className="absolute right-0 top-0 bottom-0 hidden lg:flex items-center justify-center"
          style={{
            width: 40,
            borderLeft: '2px solid #1A1C1A',
            background: 'rgba(250,249,246,0.92)',
            backdropFilter: 'blur(8px)',
          }}>
          <Tategaki className="text-[8px] tracking-[0.4em] opacity-60">
            {event.category.toUpperCase()}_EDITION
          </Tategaki>
        </div>
      </div>
    );
  }

  /* ── Text variant (no hero image) ─────────── */
  if (variant === 'text') {
    return (
      <div
        className={`group bento-card ${className}`}
        style={{...base, background: '#EFEEEB', ...style}}
        onClick={handleClick}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}>
        <div
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}>
          <div className="font-headline font-bold text-urushi text-[9px] tracking-[0.3em] uppercase">
            Upcoming · {event.category}
          </div>
          <div>
            <h4
              className="font-headline font-black uppercase"
              style={{
                fontSize: 'clamp(20px,2.5vw,32px)',
                lineHeight: 0.92,
                marginBottom: 12,
              }}>
              {event.title}
            </h4>
            <div className="flex items-center gap-2">
              <div style={{width: 8, height: 8, background: '#1A1C1A'}} />
              <span className="font-body text-[9px] font-bold uppercase tracking-[0.3em]">
                {event.location}
              </span>
            </div>
          </div>
        </div>

        <HankoStamp
          rotate={12}
          size={76}
          style={{position: 'absolute', bottom: -8, right: -8, zIndex: 10}}>
          {'Hanko\nApproved'}
        </HankoStamp>
      </div>
    );
  }

  /* ── Dark variant ────────────────────────── */
  if (variant === 'dark') {
    return (
      <div
        className={`group bento-card ${className}`}
        style={{...base, background: '#800020', ...style}}
        onClick={handleClick}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}>
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: -10,
            opacity: 0.08,
            fontSize: 120,
          }}>
          🎫
        </div>
        <div
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'flex-end',
            position: 'relative',
            zIndex: 1,
          }}>
          <h4
            className="font-headline font-black text-white uppercase"
            style={{
              fontSize: 'clamp(22px,2.5vw,36px)',
              lineHeight: 0.9,
              marginBottom: 8,
            }}>
            {event.title}
          </h4>
          <p
            className="font-headline font-bold text-[9px] tracking-[0.25em] uppercase"
            style={{color: 'rgba(255,255,255,0.5)'}}>
            {event.location}
          </p>
        </div>
      </div>
    );
  }

  /* ── Feature text variant (Kabuki) ────────── */
  return (
    <div
      className={`group bento-card ${className}`}
      style={{...base, background: '#F4F3F1', ...style}}
      onClick={handleClick}
      onMouseEnter={hoverEnter}
      onMouseLeave={hoverLeave}>
      <div
        style={{
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: '2px solid #1A1C1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}>
            🎭
          </div>
          <span
            className="font-headline font-bold text-[8px] tracking-[0.2em] uppercase"
            style={{background: '#1A1C1A', color: '#fff', padding: '4px 8px'}}>
            Archive Members Only
          </span>
        </div>
        <div>
          <h4
            className="font-headline font-black uppercase"
            style={{
              fontSize: 'clamp(22px,3vw,38px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}>
            {event.title}
          </h4>
          <p
            className="font-body text-xs leading-relaxed opacity-55"
            style={{maxWidth: 280, marginBottom: 24}}>
            {event.description}
          </p>
          <span
            className="font-headline font-black tracking-[0.15em] uppercase text-xs"
            style={{borderBottom: '3px solid #800020', paddingBottom: 2}}>
            Reserve Stalls →
          </span>
        </div>
      </div>
    </div>
  );
}
