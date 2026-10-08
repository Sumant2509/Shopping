import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          50: "#faf8f5",
          100: "#f5efe6",
          200: "#e9ddcb",
          300: "#d8c4a9",
          400: "#c4a682",
          500: "#b38a60",
          600: "#9e714d",
          700: "#7f573c",
          800: "#684734",
          900: "#553a2d",
          950: "#1d120c",
        },
        terracotta: {
          50: "#fdf4f0",
          100: "#fbe6dd",
          200: "#f7d0bf",
          300: "#efae96",
          400: "#e48366",
          500: "#d45d3c",
          600: "#be4727",
          700: "#9e381f",
          800: "#82311d",
          900: "#6c2c1c",
        },
        forest: {
          50: "#f0f7f4",
          100: "#dbede4",
          500: "#2d6a4f",
          700: "#1b4332",
          800: "#133125",
          900: "#0b1f17",
        },
        warmGold: {
          500: "#d97706",
          600: "#b45309",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(130, 49, 29, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 12px 30px -4px rgba(130, 49, 29, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'craft': '0 2px 10px rgba(179, 138, 96, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
