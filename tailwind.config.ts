import type { Config } from "tailwindcss";

/**
 * BRAND COLOURS
 * Change a hex value here and it updates across the whole website.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Forest green — main brand colour (buttons, headings, footer)
        forest: {
          50: "#EEF4F0",
          100: "#D9E7DE",
          200: "#B3CFBD",
          300: "#82AE93",
          400: "#4F8A68",
          500: "#2F6E4C",
          600: "#22583C",
          700: "#1B4732",
          800: "#143726",
          900: "#0E271B",
        },
        // Mountain grey — text and secondary elements
        mountain: {
          50: "#F2F4F5",
          100: "#E1E5E8",
          200: "#C4CBD1",
          300: "#9AA5AE",
          400: "#76828C",
          500: "#5B6670",
          600: "#47515A",
          700: "#363E45",
          800: "#272D33",
          900: "#1A1F23",
        },
        // Sunset orange — accent (Book Now, prices, highlights)
        sunset: {
          50: "#FFF4EC",
          100: "#FFE4D1",
          200: "#FFC6A1",
          300: "#FBA067",
          400: "#F7833B",
          500: "#EE6A1F",
          600: "#D15412",
          700: "#AC4211",
        },
        // Off-white page background (a cool, misty white)
        mist: "#F5F6F2",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
        sans: ['"Figtree Variable"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      maxWidth: {
        site: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
