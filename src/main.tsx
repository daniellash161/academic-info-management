import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ColorModeProvider } from "./app/ColorModeProvider.tsx";

document.documentElement.setAttribute("dir", "rtl");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </React.StrictMode>
);