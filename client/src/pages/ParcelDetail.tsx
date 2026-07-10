import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import {
  useAssignCourier,
  useCancelParcel,
  useParcel,
  useUpdateDestination,
  useUpdatePresentLocation,
  useUpdateStatus,
} from "@/api/parcels";
import { useUsers } from "@/api/users";
import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ParcelTimeline } from "@/components/ParcelTimeline";
import { PaymentChip, StatusChip } from "@/components/StatusChip";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  PARCEL_STATUSES,
  formatCurrency,
  formatDate,
  titleCase,
} from "@/utils/format";
import type {
  Location,
  Parcel,
  ParcelStatus,
  PaymentStatus,
  User,
} from "@/types/api";

const TERMINAL: ParcelStatus[] = ["delivered", "returned", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function senderId(parcel: Parcel): string {
  return typeof parcel.sender === "object" ? parcel.sender._id : parcel.sender;
}

export default function ParcelDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { claims, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const query = useParcel(id);
  const cancel = useCancelParcel();
  const updateDestination = useUpdateDestination();
  const updateStatus = useUpdateStatus();
  const updateLocation = useUpdatePresentLocation();
  const assignCourier = useAssignCourier();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  const couriersQuery = useUsers({ role: "courier", limit: 100 });

  const parcel = query.data;

  if (query.isLoading) return <Loader />;
  if (query.isError || !parcel)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const isOwner = claims?.id === senderId(parcel);
  const isAssignedCourier =
    claims?.role === "courier" && parcel.courierAssigned === claims?.id;
  const terminal = TERMINAL.includes(parcel.status);

  const canCancel = (isAdmin || isOwner) && !terminal;
  const canEditDestination = (isAdmin || isOwner) && !terminal;
  const canManageOps = isAdmin || isAssignedCourier;

  const notify = (error: unknown) =>
    enqueueSnackbar(getApiErrorMessage(error), { variant: "error" });
  const success = (message: string) =>
    enqueueSnackbar(message, { variant: "success" });

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/parcels")}
        sx={{ mb: 1 }}
      >
        Back to parcels
      </Button>

      <PageHeader
        title={parcel.trackingCode}
        subtitle={`${titleCase(parcel.parcelType)} · ${formatCurrency(
          parcel.price.amount,
          parcel.price.currency,
        )}`}
        action={<StatusChip status={parcel.status} />}
      />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Status
              </Typography>
              <ParcelTimeline status={parcel.status} progress={parcel.progress} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Details
              </Typography>
              <Stack spacing={1}>
                <Detail label="Weight" value={`${parcel.weight} kg`} />
                <Detail
                  label="Payment"
                  value={<PaymentChip status={parcel.paymentStatus} />}
                />
                <Detail
                  label="Estimated delivery"
                  value={formatDate(parcel.estimatedDelivery)}
                />
                <Detail
                  label="Delivered"
                  value={formatDate(parcel.deliveryDate)}
                />
                <Detail label="Created" value={formatDate(parcel.createdAt)} />
                <Divider sx={{ my: 1 }} />
                <Detail
                  label="Recipient"
                  value={
                    parcel.recipient
                      ? `${parcel.recipient.name} · ${parcel.recipient.email}`
                      : "—"
                  }
                />
                <Detail
                  label="From"
                  value={addressLine(parcel.locationFrom)}
                />
                <Detail label="To" value={addressLine(parcel.locationTo)} />
                <Detail
                  label="Current location"
                  value={addressLine(parcel.presentLocation)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {(canCancel || canEditDestination || canManageOps || isAdmin) && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Manage
              </Typography>
              <Stack spacing={2}>
                {canEditDestination && (
                  <Button variant="outlined" onClick={() => setDestOpen(true)}>
                    Update destination
                  </Button>
                )}

                {canManageOps && (
                  <>
                    <TextField
                      select
                      label="Update status"
                      value={parcel.status}
                      onChange={(e) =>
                        updateStatus.mutate(
                          { id, status: e.target.value as ParcelStatus },
                          {
                            onSuccess: () => success("Status updated"),
                            onError: notify,
                          },
                        )
                      }
                    >
                      {PARCEL_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {titleCase(s)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button variant="outlined" onClick={() => setLocOpen(true)}>
                      Update current location
                    </Button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <TextField
                      select
                      label="Payment status"
                      value={parcel.paymentStatus}
                      onChange={(e) =>
                        updateStatus.mutate(
                          {
                            id,
                            paymentStatus: e.target.value as PaymentStatus,
                          },
                          {
                            onSuccess: () => success("Payment status updated"),
                            onError: notify,
                          },
                        )
                      }
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {titleCase(s)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Assign courier"
                      value={parcel.courierAssigned ?? ""}
                      onChange={(e) =>
                        assignCourier.mutate(
                          { id, courierId: e.target.value },
                          {
                            onSuccess: () => success("Courier assigned"),
                            onError: notify,
                          },
                        )
                      }
                      helperText={
                        couriersQuery.data?.data.length === 0
                          ? "No couriers available"
                          : undefined
                      }
                    >
                      {(couriersQuery.data?.data ?? []).map((c: User) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.username}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}

                {canCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel parcel
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel parcel?"
        message="This will mark the parcel as cancelled. This cannot be undone."
        confirmLabel="Cancel parcel"
        confirmColor="error"
        loading={cancel.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={() =>
          cancel.mutate(id, {
            onSuccess: () => {
              success("Parcel cancelled");
              setCancelOpen(false);
            },
            onError: notify,
          })
        }
      />

      <LocationDialog
        open={destOpen}
        title="Update destination"
        initial={parcel.locationTo}
        loading={updateDestination.isPending}
        onClose={() => setDestOpen(false)}
        onSubmit={(location) =>
          updateDestination.mutate(
            { id, locationTo: location },
            {
              onSuccess: () => {
                success("Destination updated");
                setDestOpen(false);
              },
              onError: notify,
            },
          )
        }
      />

      <LocationDialog
        open={locOpen}
        title="Update current location"
        initial={parcel.presentLocation}
        loading={updateLocation.isPending}
        onClose={() => setLocOpen(false)}
        onSubmit={(location) =>
          updateLocation.mutate(
            { id, presentLocation: location },
            {
              onSuccess: () => {
                success("Location updated");
                setLocOpen(false);
              },
              onError: notify,
            },
          )
        }
      />
    </Box>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} component="div">
        {value}
      </Typography>
    </Stack>
  );
}

function addressLine(location?: Location): string {
  if (!location) return "—";
  return [location.address, location.city, location.country]
    .filter(Boolean)
    .join(", ");
}

function LocationDialog({
  open,
  title,
  initial,
  loading,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  initial?: Location;
  loading: boolean;
  onSubmit: (location: Location) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Location>(
    initial ?? { address: "", city: "" },
  );

  const set = (key: keyof Location) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const valid = form.address.trim() && form.city.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => set("address")(e.target.value)}
            required
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => set("city")(e.target.value)}
            required
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="State"
              fullWidth
              value={form.state ?? ""}
              onChange={(e) => set("state")(e.target.value)}
            />
            <TextField
              label="Country"
              fullWidth
              value={form.country ?? ""}
              onChange={(e) => set("country")(e.target.value)}
            />
          </Stack>
          <TextField
            label="Postal code"
            value={form.postalCode ?? ""}
            onChange={(e) => set("postalCode")(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!valid}
          loading={loading}
          onClick={() => onSubmit(form)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
