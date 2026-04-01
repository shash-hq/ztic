import {NavLink, useNavigate} from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      className="sticky top-0 z-50 flex justify-between items-center px-10 py-4"
      style={{
        background: 'rgba(250,249,246,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '2px solid #1A1C1A',
      }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="font-headline font-black text-sumi uppercase tracking-[0.15em] text-sm border-none bg-transparent cursor-pointer">
        ZTic
        <span className="opacity-30 mx-2">—</span>
        <span className="opacity-50 text-xs">Cinema | Events | Comedy</span>
      </button>

      {/* Nav Links */}
      <div className="hidden md:flex gap-7">
        {[
          {label: 'Cinema', to: '/?category=cinema'},
          {label: 'Events', to: '/events'},
          {label: 'Comedy', to: '/?category=comedy'},
        ].map(({label, to}) => (
          <NavLink
            key={label}
            to={to}
            className={({isActive}) =>
              `font-headline font-bold text-[11px] tracking-[0.18em] uppercase no-underline px-2 py-1 transition-all duration-100
               ${
                 isActive
                   ? 'text-urushi border-b-2 border-urushi'
                   : 'text-sumi opacity-55 hover:bg-urushi hover:text-white hover:opacity-100'
               }`
            }>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Icons */}
      <div className="flex gap-3">
        {['⌕', '◯'].map((icon, i) => (
          <button
            key={i}
            className="text-lg px-2 py-1 text-sumi transition-all duration-100 hover:bg-urushi hover:text-white border-none bg-transparent cursor-pointer">
            {icon}
          </button>
        ))}
      </div>
    </nav>
  );
}
