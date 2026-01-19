import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ColorModeProvider } from "./app/ColorModeProvider.tsx";
import { AuthSync } from "./app/AuthSync";

import "@fontsource/heebo/400.css";
import "@fontsource/heebo/700.css";

document.documentElement.setAttribute("dir", "rtl");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <AuthSync>
        <App />
      </AuthSync>
    </ColorModeProvider>
  </React.StrictMode>,
);
