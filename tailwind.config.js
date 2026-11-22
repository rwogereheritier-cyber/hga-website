/** HGA design system v1 — tokens mirror the locked design system (tokens.json). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        ivory: '#FAF7F0',
        'grey-100': '#F3F1EF',
        charcoal: '#29252A',
        'ink-muted': '#6E6870',
        hairline: '#ECE9E5',
        burgundy: '#6B142B',
        maroon: '#47101F',
        gold: '#C69A45',
        champagne: '#E5CC91',
        success: '#2F7A4D',
        danger: '#B3261E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['88px', { lineHeight: '90px', letterSpacing: '-1.5px' }],
        'display-l': ['64px', { lineHeight: '68px', letterSpacing: '-1px' }],
        'heading-1': ['52px', { lineHeight: '56px', letterSpacing: '-1px' }],
        'heading-2': ['32px', { lineHeight: '37px', letterSpacing: '-0.5px' }],
        quote: ['40px', { lineHeight: '52px', letterSpacing: '-0.5px' }],
        lead: ['21px', { lineHeight: '32px' }],
        body: ['17px', { lineHeight: '28px' }],
        small: ['15px', { lineHeight: '24px' }],
        caption: ['13px', { lineHeight: '20px' }],
        eyebrow: ['14px', { lineHeight: '20px' }],
      },
      spacing: {
        section: '160px',
        'section-sm': '96px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        hover: '0 8px 24px rgba(41, 37, 42, 0.08)',
        overlay: '0 16px 48px rgba(41, 37, 42, 0.12)',
      },
      maxWidth: {
        page: '1200px',
        prose: '620px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
