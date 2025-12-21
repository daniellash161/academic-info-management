import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#6C63FF" }, 
    background: {
      default: "#F4F6FF",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: ["Assistant", "Rubik", "Arial", "sans-serif"].join(","),
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 800 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
  },
});