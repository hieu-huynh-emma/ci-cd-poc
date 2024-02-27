module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#FFA235",
        charade: "#2E2F3C",
        chambray: "#3C4196",
        serenade: "#FFF6EC",
        "athens-gray": "#F0F0F5",
        scarlet: "#F03306",
        pizazz: "#FF8900",
        nobel: "#B3B3B3",
        "wild-sand": "#F6F6F6",
        comet: "#55576F",
        "seashell": "#F1F1F1",
        "green-pea": "#196956",
        "neutral-800": "#55576F",
        "black-65": "#595959",
        "neutral-300": "#D2D3DD",
        "cultured": "#F7F7F9",
        red: "#FF0000",
        "calm-600": "#693F73"
      },
    },
    fontFamily: {
      "acuminpro": ["acumin-pro"],
      "tiempos": ["Tiempos"],
      "inter": ["Inter"],
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      md: "20px",
      lg: ["24px", "125%"],
      xl: ["32px"],
      xxl: ["40px"],
    },
  },
  content: [
    "./assets/*.js",
    "./layout/*.liquid",
    "./templates/*.liquid",
    "./sections/*.liquid",
    "./snippets/*.liquid",
  ],
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
