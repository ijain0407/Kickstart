// TODO(A): merge these tokens into the shared design system config.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16A34A', dark: '#14532D' },
        amber: { DEFAULT: '#F59E0B' },
        coral: { DEFAULT: '#EF4444', dark: '#B91C1C' },
        sky: { DEFAULT: '#0EA5E9' },
        canvas: '#FAFAF7',
        ink: '#111827',
        muted: '#6B7280',
      },
      borderRadius: { card: '16px', btn: '12px' },
      boxShadow: { card: '0 2px 8px rgba(17,24,39,0.08)' },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        score: ['"Barlow Condensed"', '"Arial Narrow"', 'Impact', 'sans-serif'],
      },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        burst: { '0%': { transform: 'translate(0,0) scale(1)', opacity: '1' }, '100%': { transform: 'translate(var(--dx), var(--dy)) scale(0.4)', opacity: '0' } },
        pop: { '0%': { transform: 'scale(0.6)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { shake: 'shake 0.3s ease-in-out', burst: 'burst 0.7s ease-out forwards', pop: 'pop 0.35s ease-out' },
    },
  },
  plugins: [],
};
