export default function HankoStamp({
  children = 'HANKO\nAPPROVED',
  rotate = 12,
  size = 80,
  className = '',
}) {
  return (
    <div
      className={`group-hover:rotate-0 transition-transform duration-200 ${className}`}
      style={{
        width: size,
        height: size,
        background: '#800020',
        border: '2px solid #1A1C1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 900,
        fontSize: size * 0.13,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 1.25,
        textTransform: 'uppercase',
        transform: `rotate(${rotate}deg)`,
        whiteSpace: 'pre-line',
        flexShrink: 0,
      }}>
      {children}
    </div>
  );
}
