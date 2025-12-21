// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./app/theme";

document.documentElement.setAttribute("dir", "rtl");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);