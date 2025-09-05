/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'lightning': 'lightning 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(241, 196, 15, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(241, 196, 15, 0.8)' },
        },
        lightning: {
          '0%, 50%, 100%': { boxShadow: '0 0 5px #f1c40f' },
          '25%': { boxShadow: '0 0 20px #f1c40f' },
          '75%': { boxShadow: '0 0 30px #f1c40f, 0 0 50px #f1c40f' },
        },
      },
      colors: {
        'f1c40f': '#f1c40f', // Gold color for buttons and effects
        crypto: {
          green: '#00D4AA',
          red: '#FF6B6B',
          blue: '#F59E0B',
          dark: '#1A1B23',
          darker: '#13141A',
          gold: '#f1c40f',
        },
      },
      // Add more background gradient support
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
