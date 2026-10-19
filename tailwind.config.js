/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wp: {
          dark: "#1d2327",
          darker: "#131619",
          blue: "#2271b1",
          blueHover: "#135e96",
          blueActive: "#0a4b78",
          bg: "#f0f0f1",
          card: "#ffffff",
          border: "#c3c4c7",
          borderLight: "#dcdcde",
          text: "#2c3338",
          textMuted: "#646970",
          success: "#00a32a",
          warning: "#dba617",
          danger: "#d63638",
        },
      },
    },
  },
  plugins: [],
};
