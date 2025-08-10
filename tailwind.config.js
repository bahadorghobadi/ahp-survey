const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-estedad)", ...fontFamily.sans],
      },
      colors: {
        utBlue: '#0065b3',
      },
    },
  },
  plugins: [],
}