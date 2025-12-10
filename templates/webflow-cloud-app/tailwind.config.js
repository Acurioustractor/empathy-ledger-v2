/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e4ebe6',
          200: '#c9d7cd',
          300: '#a6bfac',
          400: '#7fa387',
          500: '#5a7c65',
          600: '#4a6753',
          700: '#3d5444',
          800: '#334539',
          900: '#2c3a30',
        },
        earth: {
          50: '#faf8f5',
          100: '#f2ede6',
          200: '#e4d9cc',
          300: '#d3c0a9',
          400: '#bfa384',
          500: '#8b6f4e',
          600: '#7a5f42',
          700: '#654d36',
          800: '#54402e',
          900: '#473728',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
