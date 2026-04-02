import {useEffect, useRef, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import gsap from 'gsap';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import {fetchBooking} from '../services/bookingService.js';
import {formatPrice, formatDate, formatTime} from '../utils/formatters.js';

export default function ConfirmationPage() {
  const {orderRef} = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stampRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBooking(orderRef)
      .then(res => setBooking(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderRef]);

  // Entrance animations
  useEffect(() => {
    if (!booking || !contentRef.current) return;
    const tl = gsap.timeline({defaults: {ease: 'power3.out'}});
    tl.fromTo(
      contentRef.current.querySelectorAll('.gsap-reveal'),
      {opacity: 0, y: 32},
      {opacity: 1, y: 0, duration: 0.7, stagger: 0.09}
    );
    // Stamp animation
    if (stampRef.current) {
      gsap.fromTo(
        stampRef.current,
        {scale: 1.6, rotate: -15, opacity: 0},
        {
          scale: 1,
          rotate: -6,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          delay: 0.5,
        }
      );
    }
  }, [booking]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className="flex items-center justify-center"
          style={{minHeight: '80vh'}}>
          <span
            className="font-headline font-black text-2xl tracking-widest uppercase"
            style={{opacity: 0.2}}>
            Loading Confirmation...
          </span>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div
          className="flex flex-col items-center justify-center"
          style={{minHeight: '80vh', gap: 24}}>
          <span
            className="font-headline font-black text-3xl uppercase tracking-tight"
            style={{color: '#800020'}}>
            Booking Not Found
          </span>
          <p className="font-body text-sm opacity-50">
            {error ?? 'The order reference is invalid.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="font-headline font-black uppercase text-sm tracking-widest px-8 py-4"
            style={{
              border: '2px solid #1A1C1A',
              boxShadow: '4px 4px 0 0 #1A1C1A',
              background: '#FAF9F6',
              cursor: 'pointer',
            }}>
            ← Return Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const event = booking.show?.event;
  const show = booking.show;

  return (
    <>
      <Navbar />
      <main style={{background: '#FAF9F6', minHeight: '100vh'}}>
        {/* Dark hero banner */}
        <div
          style={{
            background: '#1A1C1A',
            borderBottom: '2px solid #1A1C1A',
            padding: '64px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}>
          {/* Grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              position: 'relative',
              zIndex: 1,
            }}>
            <div
              className="font-headline font-bold text-[10px] tracking-[0.35em] uppercase inline-block px-3 py-1 mb-8"
              style={{
                background: '#800020',
                color: '#fff',
                boxShadow: '2px 2px 0 0 #800020',
              }}>
              Booking Confirmed
            </div>
            <h1
              className="font-headline font-black text-white uppercase"
              style={{
                fontSize: 'clamp(44px,8vw,96px)',
                lineHeight: 0.86,
                letterSpacing: '-0.03em',
              }}>
              Your Tickets
              <br />
              <span style={{color: '#800020'}}>Are Secured.</span>
            </h1>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '64px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 48,
            alignItems: 'start',
          }}>
          {/* Left: order detail */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
            {/* Order ref */}
            <div
              className="gsap-reveal"
              style={{
                border: '2px solid #1A1C1A',
                boxShadow: '4px 4px 0 0 #1A1C1A',
                padding: 32,
              }}>
              <p
                className="font-headline font-bold text-[9px] tracking-[0.35em] uppercase"
                style={{opacity: 0.4, marginBottom: 8}}>
                Order Reference
              </p>
              <p
                className="font-headline font-black"
                style={{
                  fontSize: 'clamp(32px,5vw,56px)',
                  letterSpacing: '-0.02em',
                  color: '#800020',
                }}>
                {booking.orderRef}
              </p>
            </div>

            {/* Event info */}
            <div
              className="gsap-reveal"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                border: '2px solid #1A1C1A',
                boxShadow: '4px 4px 0 0 #1A1C1A',
              }}>
              {[
                {label: 'Event', value: event?.title ?? '—'},
                {label: 'Venue', value: event?.location ?? '—'},
                {label: 'Date', value: show ? formatDate(show.date) : '—'},
                {label: 'Time', value: show ? formatTime(show.date) : '—'},
                {
                  label: 'Seats',
                  value: booking.seats.map(s => s.label).join(', '),
                },
                {
                  label: 'Total',
                  value: formatPrice(booking.totalAmount, booking.currency),
                  accent: true,
                },
                {label: 'Status', value: booking.status.toUpperCase()},
              ].map(({label, value, accent}, i) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '16px 24px',
                    background: i % 2 === 0 ? '#FAF9F6' : '#F4F3F1',
                    borderBottom:
                      i < 6 ? '1px solid rgba(26,28,26,0.06)' : 'none',
                  }}>
                  <span
                    className="font-headline font-bold text-[9px] tracking-[0.3em] uppercase"
                    style={{opacity: 0.4}}>
                    {label}
                  </span>
                  <span
                    className="font-headline font-bold"
                    style={{
                      fontSize: 15,
                      color: accent ? '#800020' : '#1A1C1A',
                    }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div
              className="gsap-reveal"
              style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
              <button
                onClick={() => navigate('/')}
                className="font-headline font-black uppercase text-sm tracking-widest px-10 py-4"
                style={{
                  border: '2px solid #1A1C1A',
                  background: '#FAF9F6',
                  color: '#1A1C1A',
                  boxShadow: '4px 4px 0 0 #1A1C1A',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(2px,2px)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 0 #1A1C1A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0,0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 0 #1A1C1A';
                }}>
                ← Back to Events
              </button>
              <button
                onClick={() => window.print()}
                className="font-headline font-black uppercase text-sm tracking-widest px-10 py-4"
                style={{
                  border: '2px solid #1A1C1A',
                  background: '#1A1C1A',
                  color: '#fff',
                  boxShadow: '4px 4px 0 0 #800020',
                  cursor: 'pointer',
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
                Print Ticket
              </button>
            </div>
          </div>

          {/* Right: Hanko stamp card */}
          <div
            className="gsap-reveal"
            style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            <div
              style={{
                border: '2px solid #1A1C1A',
                boxShadow: '4px 4px 0 0 #1A1C1A',
                background: '#1A1C1A',
                padding: 40,
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* Background grid */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(250,249,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,249,246,0.03) 1px,transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Stamp */}
              <div
                ref={stampRef}
                style={{
                  width: 120,
                  height: 120,
                  border: '3px solid #800020',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 32,
                  right: 32,
                  transform: 'rotate(-6deg)',
                  zIndex: 2,
                }}>
                <span
                  className="font-headline font-black text-white text-center uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    lineHeight: 1.4,
                  }}>
                  ZTic
                  <br />
                  確認済
                  <br />
                  CONFIRMED
                </span>
              </div>

              <div style={{position: 'relative', zIndex: 1}}>
                <p
                  className="font-headline font-bold text-[9px] tracking-[0.35em] uppercase"
                  style={{color: 'rgba(255,255,255,0.35)', marginBottom: 16}}>
                  Ticket Holder
                </p>
                <p
                  className="font-headline font-black text-white uppercase"
                  style={{
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    marginBottom: 32,
                    wordBreak: 'break-all',
                  }}>
                  {booking.customerEmail}
                </p>

                <p
                  className="font-headline font-bold text-[9px] tracking-[0.35em] uppercase"
                  style={{color: 'rgba(255,255,255,0.35)', marginBottom: 8}}>
                  Seat{booking.seats.length > 1 ? 's' : ''}
                </p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                  {booking.seats.map(seat => (
                    <span
                      key={seat._id}
                      className="font-headline font-bold text-white"
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.15em',
                        border: '2px solid #800020',
                        padding: '4px 10px',
                        background: 'rgba(128,0,32,0.2)',
                      }}>
                      {seat.label}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 40,
                    paddingTop: 24,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <p
                    className="font-body italic text-xs"
                    style={{color: 'rgba(255,255,255,0.35)', lineHeight: 1.65}}>
                    "Architecture is the will of an epoch translated into
                    space."
                  </p>
                  <p
                    className="font-headline font-bold text-[8px] tracking-[0.2em] uppercase"
                    style={{color: 'rgba(255,255,255,0.2)', marginTop: 8}}>
                    — Mies van der Rohe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
