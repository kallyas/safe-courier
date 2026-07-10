import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTrackParcel } from "@/api/parcels";
import { useAuth } from "@/auth/useAuth";
import { ParcelTimeline } from "@/components/ParcelTimeline";
import { StatusChip } from "@/components/StatusChip";
import { ErrorState } from "@/components/ErrorState";
import { Loader } from "@/components/Loader";
import { formatDate, formatLocation } from "@/utils/format";

export default function Track() {
  const { code: codeParam } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState(codeParam ?? "");
  const [code, setCode] = useState(codeParam ?? "");

  useEffect(() => {
    if (codeParam) {
      setInput(codeParam);
      setCode(codeParam);
    }
  }, [codeParam]);

  const query = useTrackParcel(code);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    setCode(trimmed);
    navigate(`/track/${trimmed}`);
  };

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
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              component={RouterLink}
              to="/"
              sx={{ flexGrow: 1, textDecoration: "none" }}
            >
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
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Safe Courier
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to={isAuthenticated ? "/dashboard" : "/login"}
              size="small"
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
        >
          Track your parcel
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1, mb: 4 }}
        >
          Enter a tracking code to see its current status.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="e.g. AB12CD34EF"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" variant="contained" disabled={!input.trim()}>
              Track
            </Button>
          </Stack>
        </form>

        <Box sx={{ mt: 4 }}>
          {query.isLoading && <Loader />}
          {query.isError && (
            <ErrorState error={query.error} title="Parcel not found" />
          )}
          {query.data && (
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Tracking code
                    </Typography>
                    <Typography variant="h6">
                      {query.data.trackingCode}
                    </Typography>
                  </Box>
                  <StatusChip status={query.data.status} />
                </Stack>

                <ParcelTimeline
                  status={query.data.status}
                  progress={query.data.progress}
                />

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Detail label="From" value={formatLocation(query.data.locationFrom)} />
                  <Detail label="To" value={formatLocation(query.data.locationTo)} />
                  <Detail
                    label="Current location"
                    value={formatLocation(query.data.presentLocation)}
                  />
                  <Detail
                    label="Estimated delivery"
                    value={formatDate(query.data.estimatedDelivery)}
                  />
                  <Detail
                    label="Created"
                    value={formatDate(query.data.createdAt)}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  );
}
