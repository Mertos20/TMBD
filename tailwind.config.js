/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
       fontFamily: {
        sans: ['"Source Sans Pro"', 'Arial', 'sans-serif'],
        source: ['"Source Sans Pro"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

}
