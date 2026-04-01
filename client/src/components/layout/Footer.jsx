import Tategaki from '../ui/Tategaki.jsx';

const LINKS = ['Archive', 'Newsletter', 'Membership', 'Contact'];

export default function Footer() {
  return (
    <footer
      className="flex flex-col md:flex-row justify-between items-center px-12 py-10 gap-6 flex-wrap"
      style={{borderTop: '2px solid #1A1C1A', background: '#FAF9F6'}}>
      <span className="font-body text-[10px] tracking-[0.2em] uppercase opacity-40">
        © 2025 ZTic — The Ink-Stained Architect
      </span>

      <div className="flex gap-8">
        {LINKS.map(link => (
          <a
            key={link}
            href="#"
            className="font-headline font-bold text-[11px] tracking-[0.2em] uppercase text-sumi no-underline opacity-55 hover:text-urushi hover:opacity-100 transition-colors duration-100">
            {link}
          </a>
        ))}
      </div>

      <Tategaki className="text-[8px] opacity-20">Brutalism_Serenity</Tategaki>
    </footer>
  );
}
