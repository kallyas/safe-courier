import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocalShippingIcon sx={{ fontSize: 36, color: "text.disabled" }} />
        </Box>
        <Typography
          variant="h1"
          fontWeight={800}
          color="primary"
          sx={{ fontSize: { xs: "5rem", sm: "7rem" }, lineHeight: 1, letterSpacing: "-0.04em" }}
        >
          404
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: -1 }}>
          This page could not be found.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back home
        </Button>
      </Stack>
    </Box>
  );
}
