import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#0f8b6d",
          redDark: "#0b6b55",
          blue: "#0f8b6d",
          yellow: "#f4b740",
        },
      },
    },
  },
  plugins: [],
};
export default config;
