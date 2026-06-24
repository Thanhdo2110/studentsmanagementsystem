/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 1px 3px rgba(15,23,42,.04), 0 4px 16px rgba(15,23,42,.06)' },
    },
  },
  plugins: [],
}
