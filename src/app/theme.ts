import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { blue, deepOrange, grey } from "@mui/material/colors";

export function buildTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  let theme = createTheme({
    direction: "rtl",
    palette: {
      mode,

      primary: { main: isDark ? blue[200] : blue[700] },
      secondary: { main: isDark ? deepOrange[200] : deepOrange[400] },

      background: isDark
        ? { default: grey[900], paper: grey[900] }
        : { default: grey[50], paper: "#fff" },

      text: isDark
        ? { primary: grey[100], secondary: grey[300] }
        : { primary: grey[900], secondary: grey[700] },
    },

    typography: {
      fontFamily: ["Heebo", "Roboto", "Arial", "sans-serif"].join(","),
    },

    shape: { borderRadius: 12 },
  });

  theme = responsiveFontSizes(theme);
  return theme;
}