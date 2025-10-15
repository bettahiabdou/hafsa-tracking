/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A961',
          light: '#D4AF37',
          dark: '#B8964F',
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          light: '#3A3A3A',
          dark: '#1F1F1F',
        },
        slate: {
          DEFAULT: '#4A4A4A',
          light: '#F5F5F5',
        }
      },
    },
  },
  plugins: [],
};