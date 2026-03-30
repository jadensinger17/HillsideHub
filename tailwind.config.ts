import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        brand: {
          50:  "#e8f4fb",
          100: "#c5e2f4",
          200: "#9ecce9",
          300: "#6db3dc",
          400: "#3d99ce",
          500: "#0077b5",
          600: "#00639a",
          700: "#004f7c",
          800: "#003a5c",
          900: "#00253d",
        },
        navy: {
          DEFAULT: "#000e2f",
          50:  "#e6e8f0",
          100: "#b3bad0",
          900: "#000e2f",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle:  "#f7f7f5",
          muted:   "#f0f0ee",
          border:  "#e8e8e6",
        },
      },
      boxShadow: {
        card:    "0 1px 3px rgba(0,14,47,0.06), 0 1px 2px rgba(0,14,47,0.04)",
        "card-hover": "0 4px 12px rgba(0,14,47,0.10), 0 2px 4px rgba(0,14,47,0.06)",
        input:   "0 1px 2px rgba(0,14,47,0.04)",
        modal:   "0 20px 60px rgba(0,14,47,0.18), 0 8px 20px rgba(0,14,47,0.10)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
