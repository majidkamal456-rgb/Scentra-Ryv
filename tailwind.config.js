/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    './store/templates/**/*.html',
    './static/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#070707',
          ink: '#0e0e0e',
          charcoal: '#141414',
          mist: '#1c1c1c',
          gold: '#C9A44C',
          'gold-light': '#E0C06A',
          'gold-deep': '#8F6F2A',
          cream: '#F3EEE3',
          mute: '#A8A095',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 40px rgba(201, 164, 76, 0.18)',
        'gold-soft': '0 12px 40px rgba(201, 164, 76, 0.08)',
        lift: '0 24px 60px rgba(0, 0, 0, 0.45)',
        inset: 'inset 0 1px 0 rgba(245, 241, 232, 0.06)',
      },
      backgroundImage: {
        'gold-shine':
          'linear-gradient(135deg, #8F6F2A 0%, #C9A44C 35%, #F0D78C 50%, #C9A44C 65%, #8F6F2A 100%)',
        'mesh-gold':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,164,76,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(201,164,76,0.05), transparent 50%), radial-gradient(ellipse 50% 30% at 0% 80%, rgba(201,164,76,0.06), transparent 45%)',
        'vignette':
          'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        'pulse-gold': 'pulseGold 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
