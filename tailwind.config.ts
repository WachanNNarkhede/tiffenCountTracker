import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F2ED",
        surface: "#FFFFFF",
        ink: "#26201C",
        muted: "#8A8178",
        line: "#E7E0D6",
        saffron: {
          DEFAULT: "#E39A2B",
          soft: "#FBEACB",
          deep: "#C57F16",
        },
        leaf: {
          DEFAULT: "#4C8C5A",
          soft: "#DDEEDF",
        },
        clay: {
          DEFAULT: "#B4462F",
          soft: "#F4DDD6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(38,32,28,0.04), 0 8px 24px -12px rgba(38,32,28,0.12)",
        lift: "0 2px 4px rgba(38,32,28,0.06), 0 18px 40px -18px rgba(38,32,28,0.22)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)" },
          "60%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        pop: "pop 0.28s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
