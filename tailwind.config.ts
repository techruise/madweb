import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#5B0F1A",
        wine: "#7A1626",
        space: "#1C1F26",
        graphite: "#2B2F38",
        silver: "#9AA0AB",
        ivory: "#F5F3F1",
        champagne: "#C8A97E",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
