/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#030310', card: '#0a0a1f', border: 'rgba(255,255,255,0.07)' },
      },
      animation: {
        'gradient-x':  'gradientX 10s ease infinite',
        'float':       'float 7s ease-in-out infinite',
        'float-slow':  'float 11s ease-in-out infinite',
        'spin-slow':   'spin 25s linear infinite',
        'marquee':     'marquee 30s linear infinite',
        'marquee2':    'marquee2 30s linear infinite',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'scale-in':    'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':     { transform: 'translateY(-20px) rotate(2deg)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marquee2: {
          '0%':   { transform: 'translateX(50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.05)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundSize: { '300%': '300%' },
    },
  },
  plugins: [],
}
