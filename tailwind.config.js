/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#131722',
          light: '#1f2937',
        },
        text: {
          DEFAULT: '#ffffff',
          muted: '#9ca3af',
          active: '#6366F1',
        },
        primary: {
          DEFAULT: '#6366F1',
          light: '#818CF8', 
          dark: '#4F46E5',
        },
        favorite: {
          DEFAULT: '#ef4444',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
  plugins: [],
};
