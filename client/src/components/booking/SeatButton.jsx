import {useEffect, useRef} from 'react';
import gsap from 'gsap';

// status: 'available' | 'reserved' | 'booked' | 'selected'
export default function SeatButton({seat, isSelected, onToggle}) {
  const btnRef = useRef(null);

  // Pop animation on selection
  useEffect(() => {
    if (isSelected) {
      gsap.fromTo(
        btnRef.current,
        {scale: 1.35},
        {scale: 1, duration: 0.28, ease: 'back.out(2.5)'}
      );
    }
  }, [isSelected]);

  const isBooked = seat.status === 'booked';
  const isReserved = seat.status === 'reserved' && !isSelected;
  const isPremium = seat.type === 'premium';
  const isDisabled = isBooked || isReserved;

  const getStyles = () => {
    const base = {
      width: 28,
      height: 28,
      border: '2px solid',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 7,
      fontWeight: 700,
      flexShrink: 0,
      transition: 'background 0.08s ease, border-color 0.08s ease',
    };

    if (isBooked)
      return {
        ...base,
        background: '#E3E2E0',
        borderColor: '#E3E2E0',
        opacity: 0.5,
      };
    if (isReserved)
      return {
        ...base,
        background: '#F4D0B0',
        borderColor: '#C87941',
        opacity: 0.7,
      };
    if (isSelected)
      return {
        ...base,
        background: '#800020',
        borderColor: '#800020',
        boxShadow: '2px 2px 0 0 #1A1C1A',
      };
    if (isPremium)
      return {...base, background: '#FAF9F6', borderColor: '#800020'};
    return {...base, background: '#FAF9F6', borderColor: '#1A1C1A'};
  };

  return (
    <button
      ref={btnRef}
      style={getStyles()}
      disabled={isDisabled}
      onClick={() => !isDisabled && onToggle(seat)}
      title={
        isBooked
          ? `${seat.label} — Booked`
          : isReserved
            ? `${seat.label} — Reserved (by another user)`
            : isSelected
              ? `${seat.label} — Click to deselect`
              : `${seat.label} — ¥${seat.price.toLocaleString()}${isPremium ? ' (Premium)' : ''}`
      }>
      {isSelected && (
        <span style={{color: '#fff', fontSize: 8, fontWeight: 900}}>✓</span>
      )}
    </button>
  );
}
