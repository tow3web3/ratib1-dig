/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2a1810',
          light: '#3a2820'
        },
        accent: {
          DEFAULT: '#8B0000',
          light: '#A52A2A'
        },
        surface: {
          DEFAULT: '#FFF9F0',
          light: '#FFFAF5'
        },
        border: '#2a1810',
        background: '#F5E6D3',
        text: {
          DEFAULT: '#2a1810',
          light: '#3a2820'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        body: ['Old Standard TT', 'serif'],
      },
      boxShadow: {
        'sm': '2px 2px 0 rgba(42, 24, 16, 0.1)',
        DEFAULT: '4px 4px 0 rgba(42, 24, 16, 0.1)',
        'md': '6px 6px 0 rgba(42, 24, 16, 0.1)',
        'lg': '8px 8px 0 rgba(42, 24, 16, 0.1)',
      },
      backgroundImage: {
        'paper': "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a1810' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
};