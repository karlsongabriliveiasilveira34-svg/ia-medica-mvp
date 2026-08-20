/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Sora', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        cyanAccent: {
          DEFAULT: '#00F5D4',
          hover: '#00D6B9',
          bright: '#00E5FF',
          glow: '#14F195',
          dim: 'rgba(0, 245, 212, 0.15)',
        },
        dark: {
          950: '#05080c',
          900: '#070b10',
          850: '#0a0f16',
          800: '#0e151f',
          750: '#131b27',
          700: '#1a2433',
          600: '#253246',
          border: 'rgba(255, 255, 255, 0.08)',
          borderCyan: 'rgba(0, 245, 212, 0.3)',
        },
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        gold: {
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309'
        },
        navy: {
          800: '#0f172a',
          900: '#090d16',
          950: '#030712'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 35px -5px rgba(0, 245, 212, 0.35)',
        'glow-cyan-lg': '0 0 60px -10px rgba(0, 245, 212, 0.45)',
        'glow-emerald': '0 0 40px -10px rgba(16, 185, 129, 0.3)',
        'glow-gold': '0 0 40px -10px rgba(245, 158, 11, 0.3)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'ecg-pulse': 'ecgPulse 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        ecgPulse: {
          '0%, 100%': { opacity: 0.45, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.02)' }
        }
      }
    },
  },
  plugins: [],
}


