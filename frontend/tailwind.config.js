/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      colors: {
        crypto: {
          green: '#00D4AA',
          red: '#FF6B6B',
          blue: '#4ECDC4',
          dark: '#1A1B23',
          darker: '#13141A',
        }
      }
    },
  },
  plugins: [],
}
