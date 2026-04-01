import {useEffect, useState} from 'react';

export default function Toast({message, visible}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2400);
      return () => clearTimeout(t);
    }
  }, [visible, message]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        background: '#1A1C1A',
        color: '#fff',
        padding: '14px 24px',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        border: '2px solid #800020',
        boxShadow: '4px 4px 0px 0px #800020',
        zIndex: 9999,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: 'none',
      }}>
      {message}
    </div>
  );
}
