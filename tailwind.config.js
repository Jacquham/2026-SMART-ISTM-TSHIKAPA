 /** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Charte SMART-ISTM-T'PA (logo) : bleu marine, vert, or, bleu clair, rouge
        navy: {
          50: '#EEF3FA', 100: '#D6E2F3', 200: '#B3C8E6', 300: '#8AA9D4', 400: '#5A80B9',
          500: '#2F5597', 600: '#274A85', 700: '#1F3A6E', 800: '#182E58', 900: '#122445',
        },
        green: { 50: '#E8F5EE', 100: '#CBE8D7', 500: '#22945A', 600: '#1B7A4A', 700: '#15603A' },
        gold: { 100: '#FBF0C8', 400: '#F2CC4B', 500: '#E8B923', 600: '#C99A0F' },
        sky: { 50: '#EAF4FD', 100: '#CFE6FA', 500: '#1E88E5', 600: '#1565C0' },
        red: { 50: '#FDECEF', 600: '#C8102E' },
        surface: '#F4F7FB',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 36, 69, 0.06), 0 6px 16px rgba(18, 36, 69, 0.07)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #122445 0%, #1F3A6E 55%, #1B7A4A 100%)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
