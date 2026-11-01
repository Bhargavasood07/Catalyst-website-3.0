import type { Config } from "tailwindcss";

/**
 * Design tokens live here and in app/globals.css (:root).
 * Change a colour once here and the whole site follows.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", xl: "2.5rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        void: "#09090b",
        surface: { DEFAULT: "#111116", raised: "#16161d" },
        ink: { DEFAULT: "#ededf2", muted: "#a1a1aa", faint: "#8b8b96" },
        cyan: { DEFAULT: "#22d3ee", soft: "#67e8f9" },
        indigo: { DEFAULT: "#5b5bf6", soft: "#8183ff" },
        violet: { DEFAULT: "#8b5cf6", soft: "#b197fc" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Display sizes balance their line breaks (see globals.css).
        // Modular scale (~1.25) with fluid display sizes.
        "display-xl": ["clamp(3.75rem, 11vw, 10rem)", { lineHeight: "0.88", letterSpacing: "-0.055em" }],
        "display": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
        "statement": ["clamp(1.75rem, 3.6vw, 3rem)", { lineHeight: "1.12", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        surface: "28px",
        card: "18px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px -30px rgba(91,91,246,0.45)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        "loop-travel": {
          "0%": { offsetDistance: "0%" },
          "100%": { offsetDistance: "100%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.3, 1) infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
