/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#064E3B',
          deep: '#033320',
          soft: '#065F46',
        },
        secondary: {
          DEFAULT: '#D4AF37',
          soft: '#E8CD7A',
        },
        tertiary: {
          DEFAULT: '#F5F2EA',
          muted: '#EDEAE2',
        },
        neutral: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          light: '#9CA3AF',
          border: '#E5E5E5',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        rounded: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': 20,
        '3xl': 28,
        '4xl': 36,
      },
      boxShadow: {
        card: '0 8px 30px rgba(31, 41, 55, 0.08)',
        soft: '0 4px 16px rgba(31, 41, 55, 0.06)',
      },
    },
  },
  plugins: [],
};
