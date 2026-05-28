import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        background: "#050505",
        foreground: "#ffffff",
        surface: "#0F0F0F",
        "surface-hover": "#1A1A1A",
        neon: {
          DEFAULT: "#00FF66",
          hover: "#00CC52",
          dim: "#00FF6633",
        },
        zinc: {
          850: "#1c1c1f",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        display: ["Outfit", "ui-sans-serif", "system-ui"],
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(0,255,102,0.15)" },
          "50%": { boxShadow: "0 0 28px rgba(0,255,102,0.55)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)" },
          "100%": { transform: "translateX(220%) skewX(-12deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out forwards",
        "neon-pulse": "neon-pulse 2.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        shine: "shine 1.2s ease-out",
        "accordion-down": "accordion-down 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "radial-neon":
          "radial-gradient(circle at 50% 30%, rgba(0,255,102,0.18), transparent 60%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
