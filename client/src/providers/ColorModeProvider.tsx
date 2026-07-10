import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import { buildTheme } from "@/theme";
import { ColorModeContext } from "./colorModeContext";

const STORAGE_KEY = "safe_courier_mode";

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem(STORAGE_KEY) as PaletteMode) || "light",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
