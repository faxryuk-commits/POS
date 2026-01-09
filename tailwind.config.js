/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // iOS System Colors
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#5AC8FA',
          yellow: '#FFCC00',
        },
        // iOS Gray Scale
        gray: {
          1: '#8E8E93',
          2: '#636366',
          3: '#48484A',
          4: '#3A3A3C',
          5: '#2C2C2E',
          6: '#1C1C1E',
        },
        // Theme-aware colors using CSS variables
        'themed': {
          'bg': 'var(--color-bg-primary)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary': 'var(--color-bg-tertiary)',
          'text': 'var(--color-label-primary)',
          'text-secondary': 'var(--color-label-secondary)',
          'text-tertiary': 'var(--color-label-tertiary)',
          'fill': 'var(--color-fill-tertiary)',
          'border': 'var(--color-separator)',
        },
        // Background colors (legacy)
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          grouped: 'var(--color-grouped-bg)',
        },
        // Fill colors
        fill: {
          primary: 'var(--color-fill-primary)',
          secondary: 'var(--color-fill-secondary)',
          tertiary: 'var(--color-fill-tertiary)',
          quaternary: 'var(--color-fill-quaternary)',
        },
        // Label colors
        label: {
          primary: 'var(--color-label-primary)',
          secondary: 'var(--color-label-secondary)',
          tertiary: 'var(--color-label-tertiary)',
          quaternary: 'var(--color-label-quaternary)',
        },
        // Separator
        separator: 'var(--color-separator)',
        // Legacy support
        primary: {
          50: '#e5f3ff',
          100: '#cce7ff',
          200: '#99cfff',
          300: '#66b7ff',
          400: '#339fff',
          500: '#007AFF',
          600: '#0062cc',
          700: '#004a99',
          800: '#003166',
          900: '#001933',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#8E8E93',
          500: '#636366',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#1C1C1E',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        // iOS Typography Scale
        'ios-largeTitle': ['34px', { lineHeight: '41px', letterSpacing: '0.37px', fontWeight: '700' }],
        'ios-title1': ['28px', { lineHeight: '34px', letterSpacing: '0.36px', fontWeight: '700' }],
        'ios-title2': ['22px', { lineHeight: '28px', letterSpacing: '0.35px', fontWeight: '700' }],
        'ios-title3': ['20px', { lineHeight: '25px', letterSpacing: '0.38px', fontWeight: '600' }],
        'ios-headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.41px', fontWeight: '600' }],
        'ios-body': ['17px', { lineHeight: '22px', letterSpacing: '-0.41px', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.32px', fontWeight: '400' }],
        'ios-subhead': ['15px', { lineHeight: '20px', letterSpacing: '-0.24px', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px', fontWeight: '400' }],
        'ios-caption1': ['12px', { lineHeight: '16px', letterSpacing: '0px', fontWeight: '400' }],
        'ios-caption2': ['11px', { lineHeight: '13px', letterSpacing: '0.07px', fontWeight: '400' }],
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '12px',
        'ios-xl': '16px',
        'ios-2xl': '20px',
        'ios-3xl': '24px',
        'ios-full': '9999px',
      },
      boxShadow: {
        'ios': '0 0 0 0.5px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.12)',
        'ios-lg': '0 0 0 0.5px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.16)',
        'ios-xl': '0 0 0 0.5px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.24)',
        'ios-inner': 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-lg': '40px',
        'ios-xl': '60px',
      },
      animation: {
        'ios-spring': 'ios-spring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ios-fade-in': 'ios-fade-in 0.3s ease-out',
        'ios-slide-up': 'ios-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'ios-slide-down': 'ios-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'ios-scale': 'ios-scale 0.2s ease-out',
        'ios-bounce': 'ios-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ios-pulse': 'ios-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ios-shake': 'ios-shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        'ios-spring': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'ios-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ios-slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-scale': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'ios-bounce': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'ios-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'ios-shake': {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ios-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ios-ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
