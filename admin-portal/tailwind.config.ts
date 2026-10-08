import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fff7f2',
          100: '#ffeee5',
          200: '#ffd9c7',
          300: '#ffbca0',
          400: '#fd956a',
          500: '#f56e39',
          600: '#e3511f',
          700: '#be3e14',
          800: '#9b3414',
          900: '#7e2e16',
          950: '#441407',
        },
        craft: {
          50: '#faf8f5',
          100: '#f3ede5',
          200: '#e6dacb',
          300: '#d5c2ad',
          400: '#c1a58d',
          500: '#b18c72',
          600: '#a37963',
          700: '#886252',
          800: '#6f5044',
          900: '#5c433a',
          950: '#32231e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
