import {useEffect, useRef, useState, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {io} from 'socket.io-client';
import gsap from 'gsap';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import SeatMap from '../components/booking/SeatMap.jsx';
import TicketSummary from '../components/booking/TicketSummary.jsx';
import Toast from '../components/ui/Toast.jsx';
import Tategaki from '../components/ui/Tategaki.jsx';
import {useBookingStore} from '../store/bookingStore.js';
import {useSeatSelection} from '../hooks/useSeatSelection.js';
import {
  fetchSeatMap,
  reserveSeats,
  releaseSeats,
  createBooking,
} from '../services/bookingService.js';
import {formatDate, formatTime} from '../utils/formatters.js';

// Singleton socket — created once per page mount
let socket = null;

export default function SeatSelectionPage() {
  const {slug, showId} = useParams();
  const navigate = useNavigate();
  const sessionId = useBookingStore(s => s.sessionId);
  const applyExternalUpdate = useBookingStore(s => s.applyExternalSeatUpdate);

  // Local state
  const [show, setShow] = useState(null);
  const [event, setEvent] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [isLoading, setLoad] = useState(true);
  const [isConfirming, setConfirming] = useState(false);
  const [toast, setToast] = useState({message: '', visible: false});
  const [orderRef, setOrderRef] = useState(null);

  // Seat selection reducer
  const {selectedIds, toggle, clear, count} = useSeatSelection();

  // Header animation
  const headerRef = useRef(null);

  // ── Toast helper ───────────────────────────
  const showToast = useCallback(message => {
    setToast({message, visible: true});
    setTimeout(() => setToast(t => ({...t, visible: false})), 2400);
  }, []);

  // ── Fetch seat map ─────────────────────────
  useEffect(() => {
    if (!showId) return;
    setLoad(true);
    fetchSeatMap(showId)
      .then(res => {
        setShow(res.data.show);
        setEvent(res.data.show?.event ?? null);
        setMatrix(res.data.matrix);
      })
      .catch(err => showToast(`Error: ${err.message}`))
      .finally(() => setLoad(false));
  }, [showId]);

  // ── Header entrance animation ──────────────
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current.querySelectorAll('.gsap-reveal'),
      {opacity: 0, y: 28},
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.1,
      }
    );
  }, [show]);

  // ── Socket.IO ──────────────────────────────
  useEffect(() => {
    if (!showId) return;

    socket = io(import.meta.env.VITE_SOCKET_URL, {transports: ['websocket']});

    socket.emit('join_show', {showId});

    socket.on('seats_updated', ({seats: updatedSeats}) => {
      // Merge external updates into local matrix
      setMatrix(prev =>
        prev.map(row =>
          row.map(seat => {
            const update = updatedSeats.find(u => u.id === seat._id);
            return update ? {...seat, status: update.status} : seat;
          })
        )
      );
      showToast('Seat availability updated in real-time.');
    });

    socket.on('seat_count', ({available}) => {
      setShow(prev => (prev ? {...prev, availableSeats: available} : prev));
    });

    return () => {
      socket.emit('leave_show', {showId});
      socket.disconnect();
      socket = null;
    };
  }, [showId]);

  // ── Release seats on page exit ─────────────
  useEffect(() => {
    const handleUnload = () => {
      if (selectedIds.size > 0) {
        releaseSeats([...selectedIds], sessionId).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [selectedIds, sessionId]);

  // ── Toggle seat with optimistic reserve ────
  const handleSeatToggle = useCallback(
    async seat => {
      const isDeselecting = selectedIds.has(seat._id);

      if (isDeselecting) {
        toggle(seat._id);
        showToast(`${seat.label} deselected`);
        // Release single seat hold
        releaseSeats([seat._id], sessionId).catch(() => {});
        return;
      }

      // Optimistic: add locally first for instant feedback
      toggle(seat._id);
      showToast(`${seat.label} selected — ¥${seat.price.toLocaleString()}`);

      try {
        await reserveSeats(showId, [seat._id], sessionId);
      } catch (err) {
        // Revert if API rejects (race condition: another user took it)
        toggle(seat._id);
        showToast(`⚠ ${seat.label} was just taken. Please choose another.`);
        // Mark seat as reserved in local matrix
        setMatrix(prev =>
          prev.map(row =>
            row.map(s => (s._id === seat._id ? {...s, status: 'reserved'} : s))
          )
        );
      }
    },
    [selectedIds, showId, sessionId, toggle]
  );

  // ── Confirm booking ────────────────────────
  const handleConfirm = async () => {
    if (!count) return;

    const emailInput = window.prompt(
      'ZTic Checkout\n\nEnter your email to confirm booking:'
    );
    if (!emailInput) return;

    setConfirming(true);
    try {
      const res = await createBooking(
        showId,
        [...selectedIds],
        emailInput,
        sessionId
      );
      const ref = res.data.orderRef;
      setOrderRef(ref);
      clear();
      showToast(`✓ Booking confirmed! Order: ${ref}`);
      setTimeout(() => navigate(`/confirmation/${ref}`), 1200);
    } catch (err) {
      showToast(`Booking failed: ${err.message}`);
    } finally {
      setConfirming(false);
    }
  };

  // ── Build selected seat objects from matrix ─
  const selectedSeatObjects = matrix
    .flat()
    .filter(seat => selectedIds.has(seat._id));

  // ── Render ─────────────────────────────────
  return (
    <>
      <Navbar />

      <main style={{minHeight: '100vh', background: '#FAF9F6'}}>
        {/* Page header */}
        <div
          ref={headerRef}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '48px 48px 28px',
            borderBottom: '4px solid #1A1C1A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 24,
          }}>
          <div>
            <div className="gsap-reveal" style={{marginBottom: 12}}>
              <span
                className="font-headline font-bold text-white text-[9px] tracking-[0.35em] uppercase px-3 py-1"
                style={{
                  background: '#800020',
                  boxShadow: '2px 2px 0 0 #1A1C1A',
                  display: 'inline-block',
                }}>
                Live_Session · Connection Stable
              </span>
            </div>
            <h1
              className="gsap-reveal font-headline font-black uppercase"
              style={{
                fontSize: 'clamp(44px,7vw,88px)',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
              }}>
              Seat_
              <br />
              Selection
            </h1>
          </div>

          {show && (
            <div
              className="gsap-reveal"
              style={{display: 'flex', gap: 40, flexWrap: 'wrap'}}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                <span
                  className="font-headline font-bold text-[9px] tracking-[0.3em] uppercase"
                  style={{opacity: 0.4, marginBottom: 4}}>
                  Production
                </span>
                <span
                  className="font-headline font-bold"
                  style={{fontSize: 18}}>
                  {event?.title?.replace(/ /g, '_') ?? 'THE_VOID_2025'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                <span
                  className="font-headline font-bold text-[9px] tracking-[0.3em] uppercase"
                  style={{opacity: 0.4, marginBottom: 4}}>
                  Date
                </span>
                <span
                  className="font-headline font-bold"
                  style={{fontSize: 18}}>
                  {formatDate(show.date)} · {formatTime(show.date)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                <span
                  className="font-headline font-bold text-[9px] tracking-[0.3em] uppercase"
                  style={{opacity: 0.4, marginBottom: 4}}>
                  Available
                </span>
                <span
                  className="font-headline font-bold"
                  style={{
                    fontSize: 18,
                    color: show.availableSeats < 10 ? '#800020' : '#1A1C1A',
                  }}>
                  {show.availableSeats} / {show.totalSeats}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 48,
          }}>
          {/* Seat map */}
          <section>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <SeatMap
                matrix={matrix}
                selectedIds={selectedIds}
                onToggle={handleSeatToggle}
                venueLayout={show?.venueLayout}
              />
            )}
          </section>

          {/* Summary sidebar */}
          <aside>
            <TicketSummary
              selectedSeats={selectedSeatObjects}
              onConfirm={handleConfirm}
              isLoading={isConfirming}
              orderRef={orderRef ? `Order: ${orderRef}` : null}
            />
          </aside>
        </div>

        {/* Fixed decorative corner */}
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            pointerEvents: 'none',
          }}>
          <div style={{height: 2, width: 160, background: '#1A1C1A'}} />
          <div style={{height: 2, width: 100, background: '#1A1C1A'}} />
          <p
            className="font-headline font-bold text-[8px] tracking-[0.2em] uppercase"
            style={{opacity: 0.25, marginTop: 6}}>
            03 / Zen_Interactive_Map
          </p>
        </div>

        {/* Fixed right tategaki */}
        <div
          style={{
            position: 'fixed',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
          <Tategaki
            className="font-headline font-bold text-[8px] tracking-[0.5em]"
            style={{opacity: 0.12}}>
            ZTic_Real_Time_Seat_Architect
          </Tategaki>
        </div>
      </main>

      <Footer />

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

// ── Loading skeleton ────────────────────────────
function LoadingSkeleton() {
  return (
    <div>
      <div style={{height: 6, background: '#E3E2E0', marginBottom: 6}} />
      <div
        style={{
          border: '2px solid #E3E2E0',
          background: '#F4F3F1',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          alignItems: 'center',
          minHeight: 320,
          justifyContent: 'center',
        }}>
        <div
          className="font-headline font-black uppercase tracking-widest"
          style={{fontSize: 13, opacity: 0.25}}>
          Loading Seat Map...
        </div>
        {[60, 80, 60].map((w, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              opacity: 0.15,
            }}>
            {Array.from({length: w / 10}).map((_, j) => (
              <div
                key={j}
                style={{width: 28, height: 28, background: '#1A1C1A'}}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
