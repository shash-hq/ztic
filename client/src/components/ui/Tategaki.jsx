export default function Tategaki({children, className = '', style = {}}) {
  return (
    <span
      className={`tategaki font-headline font-black tracking-widest uppercase ${className}`}
      style={style}>
      {children}
    </span>
  );
}
