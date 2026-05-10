/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#1B4F9B',  // Azul Fintra
          secondary: '#0F3672',
          accent:    '#2D7DD2',
          light:     '#EBF2FC',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2' },
        info:    { DEFAULT: '#0284C7', light: '#E0F2FE' },
        neutral: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0',
          300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B',
          600: '#475569', 700: '#334155', 800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'fintra': '0 4px 6px -1px rgba(27, 79, 155, 0.1), 0 2px 4px -1px rgba(27, 79, 155, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
