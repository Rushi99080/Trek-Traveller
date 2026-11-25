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
      keyframes: {
        twinkle: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        rise: { from: { transform: "translateY(110%)" }, to: { transform: "translateY(0)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        sweep: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "radar-ping": { "0%": { transform: "scale(1)", opacity: "0.8" }, "14%": { transform: "scale(3)", opacity: "0" }, "100%": { transform: "scale(3)", opacity: "0" } },
        flap: { from: { transform: "rotateX(85deg)", filter: "brightness(1.6)" }, to: { transform: "rotateX(0deg)", filter: "brightness(1)" } },
        "flag-up": { from: { transform: "translateY(46px)" }, to: { transform: "translateY(0)" } },
        "flag-wave": { "0%,100%": { transform: "skewY(0deg) scaleX(1)" }, "50%": { transform: "skewY(-6deg) scaleX(.92)" } },
        confetti: { "0%": { transform: "translate3d(0,0,0) rotate(0deg)", opacity: "1" }, "100%": { transform: "translate3d(var(--dx),var(--dy),0) rotate(var(--rot))", opacity: "0" } },
        fire: { "0%,100%": { transform: "scale(1,1)" }, "50%": { transform: "scale(.92,1.08)" } },
        walk: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-2px)" } },
      },
      animation: {
        twinkle: "twinkle 3.4s ease-in-out infinite",
        rise: "rise .9s cubic-bezier(.2,.7,.2,1) both",
        "fade-up": "fade-up .8s cubic-bezier(.2,.7,.2,1) both",
        sweep: "sweep 6s linear infinite",
        "radar-ping": "radar-ping 6s ease-out infinite",
        flap: "flap .12s ease-out",
        "flag-up": "flag-up 1s cubic-bezier(.2,.8,.2,1) .3s both",
        "flag-wave": "flag-wave 1.4s ease-in-out infinite",
        confetti: "confetti 1.6s cubic-bezier(.15,.6,.3,1) both",
        fire: "fire .9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
