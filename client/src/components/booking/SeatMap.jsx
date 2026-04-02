import SeatButton from './SeatButton.jsx';
import Tategaki from '../ui/Tategaki.jsx';
import {rowLabel} from '../../utils/formatters.js';

export default function SeatMap({matrix, selectedIds, onToggle, venueLayout}) {
  if (!matrix?.length) {
    return (
      <div
        className="font-headline font-black text-2xl tracking-widest uppercase text-center py-24"
        style={{opacity: 0.2}}>
        Loading Seat Map...
      </div>
    );
  }

  const {aisleAfterCol} = venueLayout ?? {aisleAfterCol: 5};

  return (
    <div>
      {/* Screen / Stage indicator */}
      <div style={{marginBottom: 40}}>
        <div
          style={{
            height: 6,
            background: '#1A1C1A',
            width: '100%',
            marginBottom: 6,
          }}
        />
        <p
          className="font-headline font-bold text-[9px] tracking-[0.5em] uppercase text-center"
          style={{opacity: 0.4}}>
          Screen / Stage
        </p>
        <div
          style={{
            height: 32,
            background:
              'linear-gradient(to bottom,rgba(26,28,26,0.07),transparent)',
          }}
        />
      </div>

      {/* Grid container */}
      <div
        style={{
          border: '2px solid #1A1C1A',
          boxShadow: '4px 4px 0 0 #1A1C1A',
          backgroundImage: 'radial-gradient(#E3E2E0 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundColor: '#FAF9F6',
          padding: '36px 20px 36px 52px',
          position: 'relative',
          overflowX: 'auto',
        }}>
        {/* Row labels — tategaki on left */}
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}>
          {matrix.map((_, ri) => (
            <Tategaki
              key={ri}
              className="font-headline font-bold text-[8px] tracking-[0.3em]"
              style={{opacity: 0.3}}>
              Row_{rowLabel(ri)}
            </Tategaki>
          ))}
        </div>

        {/* Seat rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            alignItems: 'center',
          }}>
          {matrix.map((row, ri) => (
            <div
              key={ri}
              style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              {row.map((seat, ci) => (
                <div
                  key={seat._id}
                  style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  {/* Aisle gap */}
                  {ci === aisleAfterCol && (
                    <div style={{width: 28, flexShrink: 0}} />
                  )}
                  <SeatButton
                    seat={seat}
                    isSelected={selectedIds.has(seat._id)}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap'}}>
        {[
          {label: 'Available', bg: '#FAF9F6', border: '#1A1C1A'},
          {label: 'Selected', bg: '#800020', border: '#800020'},
          {label: 'Premium', bg: '#FAF9F6', border: '#800020'},
          {label: 'Reserved', bg: '#F4D0B0', border: '#C87941'},
          {label: 'Booked', bg: '#E3E2E0', border: '#E3E2E0', opacity: 0.5},
        ].map(({label, bg, border, opacity = 1}) => (
          <div
            key={label}
            style={{display: 'flex', alignItems: 'center', gap: 8, opacity}}>
            <div
              style={{
                width: 14,
                height: 14,
                background: bg,
                border: `2px solid ${border}`,
                flexShrink: 0,
              }}
            />
            <span
              className="font-headline font-bold text-[9px] tracking-[0.25em] uppercase"
              style={{color: label === 'Selected' ? '#800020' : '#1A1C1A'}}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
