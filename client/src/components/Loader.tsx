import { Box, CircularProgress } from "@mui/material";

export function Loader({ minHeight = 240 }: { minHeight?: number | string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
