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
        cream: "#FFFBF5",
        black: "#000000",
        white: "#FFFFFF",
        red: "#FF6B6B",
        lime: "#C7F464",
        teal: "#4ECDC4",
        yellow: "#FFE66D",
        purple: "#A388EE",
        pink: "#FF8ED4",
        orange: "#FFA447",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
