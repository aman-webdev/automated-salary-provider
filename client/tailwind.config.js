module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        OpenSans: ["Open Sans", " sans-serif"],
        Poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        accent: "#9ef182",
        "dark-800": "#1f332c",
        "dark-500": "#344841",
      },
      leading: {
        10: "3rem",
      },
    },
  },

  plugins: [],
};
