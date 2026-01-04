import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { blue, deepOrange, grey } from "@mui/material/colors";

export function buildTheme(mode: "light" | "dark") {
  let theme = createTheme({
    direction: "rtl",
    palette: {
      mode,
      primary: { main: blue[700] },
      secondary: { main: deepOrange[400] },
      background:
        mode === "dark"
          ? { default: grey[900], paper: grey[900] }
          : { default: grey[50], paper: "#fff" },
    },
    typography: {
      fontFamily: ["Heebo", "Roboto", "Arial", "sans-serif"].join(","),
    },
    shape: { borderRadius: 12 },
  });

  theme = responsiveFontSizes(theme);
  return theme;
}