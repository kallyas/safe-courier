import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/VerifiedUserOutlined";
import MapIcon from "@mui/icons-material/MapOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "@/auth/useAuth";

const FEATURES = [
  {
    icon: <ShieldIcon />,
    title: "Secure by design",
    body: "JWT-authenticated APIs, role-based access, and validated requests end to end.",
    color: "#059669",
  },
  {
    icon: <MapIcon />,
    title: "Live tracking",
    body: "Follow every parcel from pickup to delivery with real-time status updates.",
    color: "#0284c7",
  },
  {
    icon: <BoltIcon />,
    title: "Fast & reliable",
    body: "Atomic operations and an indexed backend keep your logistics moving.",
    color: "#d97706",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            sx={{ h: 60, minHeight: 60 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <LocalShippingIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Safe Courier
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component={RouterLink} to="/track" size="small">
                Track
              </Button>
              {isAuthenticated ? (
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="contained"
                  size="small"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" size="small">
                    Sign in
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/signup"
                    variant="contained"
                    size="small"
                  >
                    Get started
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center", py: { xs: 8, md: 12 } }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3.25rem" }, lineHeight: 1.15 }}
          >
            Deliver parcels with confidence
          </Typography>
          <Typography
            sx={{ mt: 2, mb: 5, opacity: 0.85, fontSize: "1.125rem", maxWidth: 560, mx: "auto" }}
          >
            Create, manage, and track deliveries on a secure modern platform built
            for senders, couriers, and admins.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to={isAuthenticated ? "/dashboard" : "/signup"}
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#fff",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
              endIcon={<ChevronRightIcon />}
            >
              {isAuthenticated ? "Go to dashboard" : "Get started free"}
            </Button>
            <Button
              component={RouterLink}
              to="/track"
              size="large"
              sx={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Track a parcel
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight={700}
            sx={{ mb: 6 }}
          >
            Everything you need for smooth deliveries
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {FEATURES.map((f) => (
              <Box
                key={f.title}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  textAlign: "center",
                  p: 4,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${f.color}14`,
                    color: f.color,
                    mx: "auto",
                    mb: 2.5,
                    "& .MuiSvgIcon-root": { fontSize: 24 },
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}