import {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {formatPrice} from '../../utils/formatters.js';

export default function TicketSummary({
  selectedSeats, // array of seat objects currently selected
  onConfirm,
  isLoading,
  orderRef,
}) {
  const listRef = useRef(null);
  const totalRef = useRef(null);

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // Animate new items as they appear
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.seat-item');
    if (!items.length) return;
    gsap.fromTo(
      items[items.length - 1],
      {opacity: 0, x: 14},
      {opacity: 1, x: 0, duration: 0.22, ease: 'power2.out'}
    );
  }, [selectedSeats.length]);

  // Animate total change
  useEffect(() => {
    if (!totalRef.current) return;
    gsap.fromTo(
      totalRef.current,
      {scale: 1.08},
      {scale: 1, duration: 0.2, ease: 'power2.out'}
    );
  }, [total]);

  return (
    <div
      style={{
        border: '2px solid #1A1C1A',
        boxShadow: '4px 4px 0 0 #1A1C1A',
        background: '#FAF9F6',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        position: 'sticky',
        top: 88,
        alignSelf: 'start',
      }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
        <h2
          className="font-headline font-black uppercase"
          style={{fontSize: 22, lineHeight: 1, letterSpacing: '-0.02em'}}>
          Ticket_
          <br />
          Summary
        </h2>
        <span
          className="tategaki font-headline font-bold text-[8px] tracking-[0.25em]"
          style={{
            opacity: 0.35,
            borderLeft: '1px solid #1A1C1A',
            paddingLeft: 8,
          }}>
          {orderRef ?? 'ORDER_NO: —'}
        </span>
      </div>

      {/* Seat list */}
      <div
        ref={listRef}
        style={{
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
        {selectedSeats.length === 0 ? (
          <span
            className="font-headline text-[11px] tracking-[0.2em] uppercase"
            style={{opacity: 0.3}}>
            No seats selected
          </span>
        ) : (
          selectedSeats.map(seat => (
            <div
              key={seat._id}
              className="seat-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '12px 0',
                borderBottom: '1px solid rgba(26,28,26,0.08)',
              }}>
              <div>
                <p
                  className="font-headline font-bold text-[8px] tracking-[0.25em] uppercase"
                  style={{opacity: 0.4, marginBottom: 4}}>
                  {seat.type === 'premium' ? 'Premium Seat' : 'Seat'}
                </p>
                <p className="font-headline font-bold" style={{fontSize: 16}}>
                  Row_{seat.label}
                </p>
              </div>
              <p className="font-headline font-bold" style={{fontSize: 15}}>
                {formatPrice(seat.price)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Total + CTA */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 24,
          }}>
          <span
            className="font-headline font-black uppercase"
            style={{fontSize: 26, letterSpacing: '-0.02em'}}>
            Total
          </span>
          <span
            ref={totalRef}
            className="font-headline font-black"
            style={{fontSize: 26, color: '#800020', display: 'inline-block'}}>
            {formatPrice(total)}
          </span>
        </div>

        <button
          disabled={selectedSeats.length === 0 || isLoading}
          onClick={onConfirm}
          className="font-headline font-black uppercase"
          style={{
            width: '100%',
            background: selectedSeats.length === 0 ? '#E3E2E0' : '#1A1C1A',
            color: '#fff',
            border: 'none',
            padding: '20px 0',
            fontSize: 13,
            letterSpacing: '0.22em',
            cursor:
              selectedSeats.length === 0 || isLoading
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow:
              selectedSeats.length === 0 ? 'none' : '4px 4px 0 0 #800020',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={e => {
            if (selectedSeats.length && !isLoading) {
              e.currentTarget.style.transform = 'translate(2px,2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0,0)';
            e.currentTarget.style.boxShadow = selectedSeats.length
              ? '4px 4px 0 0 #800020'
              : 'none';
          }}>
          {isLoading ? 'Processing...' : 'Confirm_Selection'}
          {!isLoading && <span style={{fontSize: 18}}>→</span>}
        </button>

        <p
          className="font-headline text-[8px] tracking-[0.18em] uppercase text-center"
          style={{opacity: 0.3, marginTop: 12, lineHeight: 1.65}}>
          By proceeding, you agree to the architectural standards of the Zen
          Theater. No refunds for late arrivals.
        </p>
      </div>

      {/* Hanko callout */}
      <div
        style={{
          border: '2px dashed rgba(26,28,26,0.2)',
          padding: 24,
          position: 'relative',
          marginTop: 8,
        }}>
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: -16,
            width: 44,
            height: 44,
            background: '#800020',
            border: '2px solid #1A1C1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 18,
            color: '#fff',
          }}>
          印
        </div>
        <p
          className="font-body italic text-xs"
          style={{opacity: 0.5, lineHeight: 1.65}}>
          "The space between seats is as important as the seat itself. In
          emptiness, there is potential."
        </p>
        <p
          className="font-headline font-bold text-[9px] tracking-[0.2em] uppercase"
          style={{opacity: 0.3, marginTop: 12}}>
          — Architect of Void
        </p>
      </div>
    </div>
  );
}
