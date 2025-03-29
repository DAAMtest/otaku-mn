/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A1929",
          light: "#132F4C",
        },
        text: {
          DEFAULT: "#ffffff",
          muted: "#9ca3af",
          active: "#40C057",
        },
        primary: {
          DEFAULT: "#40C057", // Deku's green
          light: "#69DB7C",
          dark: "#2B9348",
        },
        secondary: {
          DEFAULT: "#FF5252", // Accent red
          light: "#FF7B7B",
          dark: "#D32F2F",
        },
        favorite: {
          DEFAULT: "#FF5252",
        },
        accent: {
          DEFAULT: "#FFD600", // Yellow accent (All Might)
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
    },
  },
  plugins: [],
};
