/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        quantum: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          accent: '#f59e0b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'energy-barrier': 'linear-gradient(45deg, rgba(239, 68, 68, 0.8) 0%, rgba(245, 101, 101, 0.8) 50%, rgba(239, 68, 68, 0.8) 100%)',
      }
    },
  },
  plugins: [],
};