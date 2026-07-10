import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import HourglassIcon from "@mui/icons-material/HourglassEmpty";
import type { ReactNode } from "react";
import { useParcels } from "@/api/parcels";
import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import { ErrorState } from "@/components/ErrorState";
import { StatusChip } from "@/components/StatusChip";
import { formatRelative } from "@/utils/format";
import type { Parcel } from "@/types/api";

export default function Dashboard() {
  const { claims } = useAuth();
  const query = useParcels({ limit: 100 });

  const parcels = query.data?.data ?? [];
  const total = query.data?.pagination.total ?? parcels.length;
  const count = (status: Parcel["status"]) =>
    parcels.filter((p) => p.status === status).length;

  return (
    <Box>
      <PageHeader
        title={`Welcome${claims ? `, ${claims.username}` : ""}`}
        subtitle="Here's an overview of your deliveries"
        action={
          <Button
            component={RouterLink}
            to="/parcels/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            New parcel
          </Button>
        }
      />

      {query.isLoading && <Loader />}
      {query.isError && (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      )}

      {query.data && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
            }}
          >
            <StatCard
              label="Total parcels"
              value={total}
              icon={<Inventory2Icon />}
              color="primary.main"
            />
            <StatCard
              label="In transit"
              value={count("in-transit")}
              icon={<LocalShippingIcon />}
              color="info.main"
            />
            <StatCard
              label="Pending"
              value={count("pending")}
              icon={<HourglassIcon />}
              color="warning.main"
            />
            <StatCard
              label="Delivered"
              value={count("delivered")}
              icon={<DoneAllIcon />}
              color="success.main"
            />
          </Box>

          <Card>
            <CardContent sx={{ "&:last-child": { pb: 2 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Recent parcels</Typography>
                <Button component={RouterLink} to="/parcels" size="small">
                  View all
                </Button>
              </Stack>
              {parcels.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3 }}>
                  No parcels yet. Create your first one to get started.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Tracking</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcels.slice(0, 6).map((parcel) => (
                      <TableRow
                        key={parcel._id}
                        hover
                        component={RouterLink}
                        to={`/parcels/${parcel._id}`}
                        sx={{
                          textDecoration: "none",
                          cursor: "pointer",
                          "& td": { color: "text.primary" },
                        }}
                      >
                        <TableCell>{parcel.trackingCode}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>
                          {parcel.parcelType}
                        </TableCell>
                        <TableCell>
                          <StatusChip status={parcel.status} />
                        </TableCell>
                        <TableCell align="right">
                          {formatRelative(parcel.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: color,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        },
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 }, pt: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) =>
                theme.palette.mode === "light" ? `${color}14` : `${color}24`,
              color,
              "& .MuiSvgIcon-root": { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
