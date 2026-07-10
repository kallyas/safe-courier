import { useContext } from "react";
import { ColorModeContext } from "./colorModeContext";

export const useColorMode = () => useContext(ColorModeContext);
