/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        primary: '#10B981',
        brand: {
          50: '#f2fbf6',
          100: '#e6f7ed',
          200: '#bff0d2',
          300: '#99e8b6',
          400: '#4ddc86',
          500: '#10B981',
          600: '#0e9a69',
          700: '#0b6b47'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto']
      }
    },
  },
  plugins: [],
}
