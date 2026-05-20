/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        veltrix: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff3131',
          600: '#ed1515',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
          950: '#4b0404',
        },
        maroon: {
          DEFAULT: '#800020',
          light: '#a0102a',
          dark: '#5c0016',
          glow: '#cc0033',
        },
        surface: {
          0: '#ffffff',
          1: '#fafafa',
          2: '#f5f5f5',
          3: '#efefef',
          4: '#e8e8e8',
        },
        ink: {
          DEFAULT: '#0a0a0a',
          secondary: '#3d3d3d',
          tertiary: '#6b6b6b',
          muted: '#9b9b9b',
          ghost: '#c4c4c4',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-clash)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(128, 0, 32, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(128, 0, 32, 0.6), 0 0 100px rgba(128, 0, 32, 0.2)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'maroon-gradient': 'linear-gradient(135deg, #800020 0%, #cc0033 50%, #800020 100%)',
        'surface-gradient': 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(128,0,32,0.1) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(128, 0, 32, 0.2)',
        'glow': '0 0 30px rgba(128, 0, 32, 0.3)',
        'glow-lg': '0 0 60px rgba(128, 0, 32, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
