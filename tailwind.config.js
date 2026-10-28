/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          50: '#FAF7EE',
          100: '#F4EED9',
          200: '#E9DCB2',
          300: '#DFCA8B',
          400: '#D4AF37',
          500: '#C5A059',
          600: '#B38F24',
          700: '#8C6F1B',
          800: '#664F13',
          900: '#40310B',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FDFBF7',
          200: '#FAF6ED',
          300: '#F5EEE2',
          400: '#ECE2D0',
        },
        beige: {
          50: '#FAF8F5',
          100: '#F4EFEA',
          200: '#EBE2D9',
          300: '#DDD1C3',
          400: '#C8B6A2',
        },
        brown: {
          50: '#F7F5F3',
          100: '#EBE5DF',
          200: '#D8CBC0',
          300: '#B8A18F',
          400: '#8C6F58',
          500: '#684E39',
          600: '#4F3827',
          700: '#3D2314',
          800: '#2C1810',
          900: '#1F1209',
          950: '#130A05',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 10px 30px -4px rgba(212, 175, 55, 0.35)',
        'soft': '0 2px 15px -3px rgba(44, 24, 16, 0.08)',
        'soft-lg': '0 10px 25px -5px rgba(44, 24, 16, 0.12)',
      }
    },
  },
  plugins: [],
}
