import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import BentoGrid from '../components/landing/BentoGrid.jsx';
import EventsStrip from '../components/landing/EventsStrip.jsx';
import Newsletter from '../components/landing/Newsletter.jsx';

// Marquee banner
function Marquee() {
  const items = [
    'Brutalist Symphony',
    'Midnight Noir',
    'Underground Kabuki Sessions',
    'Architects of Comedy',
    'Structural Tension',
    'Annual Passport 2025',
  ];
  const doubled = [...items, ...items];

  return (
    <div
      style={{
        borderTop: '2px solid #1A1C1A',
        borderBottom: '2px solid #1A1C1A',
        background: '#1A1C1A',
        padding: '14px 0',
        overflow: 'hidden',
      }}>
      <div
        style={{
          display: 'flex',
          animation: 'marquee 22s linear infinite',
          whiteSpace: 'nowrap',
        }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-headline font-black text-white text-[11px] tracking-[0.25em] uppercase"
            style={{padding: '0 32px', opacity: 0.65, flexShrink: 0}}>
            {item}
            <span style={{color: '#800020', opacity: 1, margin: '0 8px'}}>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <BentoGrid />
        <EventsStrip />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
