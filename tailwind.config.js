/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mars: {
          900: '#3a0f08',
          800: '#5c190f',
          700: '#872517',
          600: '#b83b23',
          500: '#d9532f',
          400: '#e8734e',
          300: '#f19b7f',
          200: '#f8c7b6',
          100: '#fdebe4',
          dust: '#c1440e',
          rust: '#a83c1b',
          glow: '#ff6239',
          dark: '#0a0d13',
          space: '#05070a',
          surface: '#11151d',
          card: 'rgba(18, 22, 32, 0.75)',
          border: 'rgba(217, 83, 47, 0.25)',
          grid: 'rgba(232, 115, 78, 0.15)'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace']
      }
    },
  },
  plugins: [],
};
