/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Neutral palette — single-tone, professional
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Single accent — slate-blue
        accent: {
          50: '#f0f4ff',
          100: '#dde5ff',
          200: '#c0cfff',
          300: '#93adff',
          400: '#6080ff',
          500: '#3d5eff',
          600: '#2640f5',
          700: '#1e30de',
          800: '#1d2cb4',
          900: '#1d2a8e',
          950: '#141a5a',
        },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        88: '22rem',
        96: '24rem',
        112: '28rem',
        128: '32rem',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
      },
      // No animations per requirements
      animation: {},
      keyframes: {},
    },
  },
  plugins: [],
};
