import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F5",
        ink: "#111110",
        stone: { DEFAULT: "#8A8680", light: "#B5B1AA" },
        track: "#E9E5DE",
        signal: { DEFAULT: "#FF5A1F", soft: "#FFF0E9", deep: "#E24A12" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,16,0.04), 0 8px 24px rgba(17,17,16,0.06)",
        lift: "0 2px 4px rgba(17,17,16,0.05), 0 16px 40px rgba(17,17,16,0.10)",
        pin: "0 2px 8px rgba(226,74,18,0.35)",
      },
      borderRadius: { xl2: "1.25rem" },
      animation: {
        "pulse-pin": "pulsePin 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        pulsePin: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "70%": { transform: "scale(2.2)", opacity: "0" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
