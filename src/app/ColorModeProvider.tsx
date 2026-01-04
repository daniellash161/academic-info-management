import React from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { buildTheme } from "./theme";

type Mode = "light" | "dark";

export const ColorModeContext = React.createContext<{
  mode: Mode;
  toggle: () => void;
}>({
  mode: "light",
  toggle: () => {},
});

const LS_KEY = "ui.mode";

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  const toggle = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(LS_KEY, next);
      return next;
    });
  }, []);

  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}