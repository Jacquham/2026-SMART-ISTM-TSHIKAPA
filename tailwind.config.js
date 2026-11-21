/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Charte SMART-ISTM-T'PA (logo) : bleu marine, vert, or, rouge
        navy: { 50: '#EEF3FA', 100: '#D6E2F3', 500: '#2F5597', 700: '#1F3A6E', 900: '#122445' },
        green: { 600: '#1B7A4A', 700: '#15603A' },
        gold: { 400: '#F2CC4B', 500: '#E8B923' },
        red: { 600: '#C8102E' },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
