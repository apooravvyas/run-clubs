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
        // Accent (Workabout terracotta) driven by CSS vars so opacity modifiers work.
        signal: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          soft: "var(--accent-soft)",
          deep: "rgb(var(--accent-deep-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,16,0.04), 0 8px 24px rgba(17,17,16,0.06)",
        lift: "0 2px 4px rgba(17,17,16,0.05), 0 16px 40px rgba(17,17,16,0.10)",
        pin: "0 2px 8px rgba(217,119,87,0.35)",
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
