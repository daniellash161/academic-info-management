import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./app/theme";
import { runSeed } from "./storage/seed";

document.documentElement.setAttribute("dir", "rtl");

try {
  runSeed();
} catch (e) {
  console.error("seed failed:", e);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);