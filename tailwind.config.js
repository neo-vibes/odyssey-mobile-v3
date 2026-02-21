/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Odyssey Brand - Gold
        gold: {
          DEFAULT: "#FFB84D",
          50: "#FFF8EB",
          100: "#FFEFD1",
          200: "#FFDD9F",
          300: "#FFCB6D",
          400: "#FFB84D", // Primary gold
          500: "#F5A623", // Hover state
          600: "#D4920A", // Muted/Disabled
          700: "#A67308",
          800: "#785306",
          900: "#2E1065", // Subtle background
        },
        // Dark mode backgrounds
        background: {
          DEFAULT: "#0A0A0A",
          black: "#000000", // OLED black
          base: "#0A0A0A", // Primary background
          elevated: "#141414", // Cards, modals
          subtle: "#1C1C1E", // Input fields
          hover: "#262626", // Interactive states
        },
        // Text colors
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#52525B",
        },
        // Semantic colors
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["SpaceGrotesk", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono", "monospace"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", fontWeight: "700" }],
        h1: ["32px", { lineHeight: "40px", fontWeight: "600" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "500" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        micro: ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
