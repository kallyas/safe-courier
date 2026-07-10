import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Paper, Stack, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
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
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: "none", mb: 4 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" color="text.primary" fontWeight={700}>
            Safe Courier
          </Typography>
        </Stack>

        <Paper
          variant="outlined"
          sx={{ p: { xs: 3, sm: 4 }, width: "100%", borderRadius: 3 }}
        >
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {children}
        </Paper>

        {footer && (
          <Box sx={{ mt: 3, textAlign: "center" }}>{footer}</Box>
        )}
      </Box>
    </Box>
  );
}
