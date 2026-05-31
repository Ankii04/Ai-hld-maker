/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary':  '#1a1a28',
        'border':       '#2a2a3d',
        'accent-blue':  '#3b82f6',
        'accent-purple':'#8b5cf6',
        'accent-cyan':  '#06b6d4',
        'accent-green': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-red':   '#ef4444',
        'text-primary': '#f1f5f9',
        'text-secondary':'#94a3b8',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.15)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.35), 0 0 60px rgba(139,92,246,0.15)',
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.35),  0 0 60px rgba(6,182,212,0.15)',
        'glow-green':  '0 0 20px rgba(16,185,129,0.35), 0 0 60px rgba(16,185,129,0.15)',
        'glow-sm-blue':'0 0 10px rgba(59,130,246,0.25)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59,130,246,0.35)' },
          '50%':      { opacity: '0.85', boxShadow: '0 0 40px rgba(59,130,246,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer:          'shimmer 2.5s linear infinite',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
        float:            'float 3s ease-in-out infinite',
        'gradient-x':     'gradient-x 4s ease infinite',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'scale-in':       'scale-in 0.25s ease-out forwards',
        'spin-slow':      'spin-slow 8s linear infinite',
      },
      backgroundSize: {
        '200%': '200%',
        '400%': '400%',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
      },
    },
  },
  plugins: [],
}
