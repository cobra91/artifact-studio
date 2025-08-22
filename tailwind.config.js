/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/sandbox.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [import("tailwindcss-animate")],
};
