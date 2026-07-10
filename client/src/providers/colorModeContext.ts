import { createContext } from "react";
import type { PaletteMode } from "@mui/material";

export interface ColorModeContextValue {
  mode: PaletteMode;
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  toggle: () => {},
});
