import { createTheme, type PaletteMode } from "@mui/material";

const PRIMARY = "#0d9488";

export function buildTheme(mode: PaletteMode) {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: { main: PRIMARY, light: "#14b8a6", dark: "#0f766e" },
      secondary: { main: "#78716c" },
      success: { main: "#059669" },
      warning: { main: "#d97706" },
      error: { main: "#dc2626" },
      info: { main: "#0284c7" },
      ...(isLight
        ? {
            background: { default: "#f1f5f9", paper: "#ffffff" },
            text: { primary: "#0f172a", secondary: "#64748b" },
            divider: "#e2e8f0",
          }
        : {
            background: { default: "#0f172a", paper: "#1e293b" },
            text: { primary: "#f1f5f9", secondary: "#94a3b8" },
            divider: "#1e293b",
          }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h4: { fontWeight: 700, letterSpacing: "-0.03em" },
      h5: { fontWeight: 700, letterSpacing: "-0.02em" },
      h6: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
      caption: { fontWeight: 500, letterSpacing: "0.03em" },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            transition: "box-shadow 0.2s, border-color 0.2s",
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 20px",
            transition: "all 0.15s",
          },
          sizeLarge: { padding: "12px 28px", fontSize: "1rem" },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            "&:hover": {
              borderColor: theme.palette.text.primary,
              bgcolor: "transparent",
            },
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
          sizeSmall: { fontSize: "0.75rem" },
        },
      },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiDrawer: { styleOverrides: { paper: { borderRight: "none" } } },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 600, color: "text.secondary" },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              "& fieldset": { borderColor: theme.palette.divider },
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14 },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6 },
        },
      },
    },
  });
}
