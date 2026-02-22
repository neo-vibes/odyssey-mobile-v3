/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
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
          400: "#FFB84D",
          500: "#E5A545",
          600: "#CC923D",
        },
        // Backgrounds
        background: {
          base: "#0D0D0F",
          elevated: "#1A1A1E",
          surface: "#2A2A2E",
        },
        // Text
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A8",
          muted: "#6B6B73",
        },
        // Status
        success: "#4ADE80",
        error: "#F87171",
        warning: "#FBBF24",
      },
      fontSize: {
        h1: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        small: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
