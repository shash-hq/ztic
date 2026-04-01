/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Override ALL default border radii — zero roundness everywhere
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '9999px', // kept only for explicit pill use (legend dots)
    },
    extend: {
      colors: {
        // ── Core Palette ─────────────────────────────
        sumi: '#1A1C1A',           // Sumi Ink Black — borders, text
        washi: '#FAF9F6',          // Washi Paper — background
        urushi: '#800020',         // Urushi Burgundy — primary accent
        'urushi-deep': '#570013',  // Deep lacquer — hover states

        // ── Surface Tiers (paper depth) ───────────────
        'surface':               '#FAF9F6',
        'surface-low':           '#F4F3F1',
        'surface-mid':           '#EFEEEB',
        'surface-high':          '#E9E8E5',
        'surface-highest':       '#E3E2E0',
        'surface-muted':         '#E3E2E0',

        // ── Semantic ──────────────────────────────────
        'on-surface':            '#1A1C1A',
        'on-primary':            '#FFFFFF',
        'outline':               '#8C7071',
        'outline-variant':       'rgba(224,191,191,0.15)',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body:     ['Manrope', 'sans-serif'],
        label:    ['Manrope', 'sans-serif'],
        mono:     ['"Space Mono"', 'monospace'],
      },
      fontSize: {
        // Architectural scale
        'display-2xl': ['clamp(80px,14vw,200px)', { lineHeight: '0.82', letterSpacing: '-0.03em' }],
        'display-xl':  ['clamp(56px,9vw,120px)',  { lineHeight: '0.86', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(40px,6vw,88px)',   { lineHeight: '0.88', letterSpacing: '-0.025em' }],
        'display-md':  ['clamp(28px,4vw,52px)',   { lineHeight: '0.92', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        // Hard brutalist shadows — zero blur always
        'hard':       '4px 4px 0px 0px #1A1C1A',
        'hard-sm':    '2px 2px 0px 0px #1A1C1A',
        'hard-white': '4px 4px 0px 0px #FFFFFF',
        'hard-urushi':'4px 4px 0px 0px #800020',
        'hard-inset': 'inset 2px 2px 0px 0px #1A1C1A',
      },
      borderWidth: {
        DEFAULT: '2px',   // All borders default to 2px Sumi
        '0': '0px',
        '1': '1px',
        '4': '4px',
      },
      spacing: {
        // Extra large breathing room tokens (Zen negative space)
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
        '72': '18rem',
        '88': '22rem',
        '96': '24rem',
        '112': '28rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'brutal': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'stamp-in': {
          '0%':   { transform: 'scale(1.4) rotate(-8deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
        },
        'hard-press': {
          '0%':   { boxShadow: '4px 4px 0px 0px #1A1C1A', transform: 'translate(0,0)' },
          '100%': { boxShadow: '2px 2px 0px 0px #1A1C1A', transform: 'translate(2px,2px)' },
        },
      },
      animation: {
        'marquee':    'marquee 22s linear infinite',
        'stamp-in':   'stamp-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'hard-press': 'hard-press 0.1s ease forwards',
      },
      backgroundImage: {
        // Washi paper grain — SVG data URI
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        // Zen garden dot grid — used on seat map
        'zen-dots': "radial-gradient(#E3E2E0 1px, transparent 1px)",
      },
      backgroundSize: {
        'zen-dots': '32px 32px',
      },
    },
  },
  plugins: [],
};
