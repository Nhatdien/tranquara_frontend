// tailwind.config.js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}', // adjust to your file types
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
};
