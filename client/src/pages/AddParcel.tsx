import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { z } from "zod";
import { useCreateParcel } from "@/api/parcels";
import { PageHeader } from "@/components/PageHeader";
import { getApiErrorMessage } from "@/lib/apiClient";
import { PARCEL_TYPES, titleCase } from "@/utils/format";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().min(0, "Must be positive").optional(),
);

const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const schema = z.object({
  parcelType: z.enum(PARCEL_TYPES),
  weight: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z
      .number({ invalid_type_error: "Weight is required" })
      .min(0.1, "Weight must be at least 0.1 kg")
      .max(1000, "Weight cannot exceed 1000 kg"),
  ),
  description: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  dimensions: z.object({
    length: optionalNumber,
    width: optionalNumber,
    height: optionalNumber,
    unit: z.enum(["cm", "in"]),
  }),
  recipient: z.object({
    name: z.string().min(2, "Recipient name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
  }),
  locationFrom: locationSchema,
  locationTo: locationSchema,
});

type ParcelForm = z.infer<typeof schema>;

export default function AddParcel() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const createParcel = useCreateParcel();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParcelForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      parcelType: "package",
      dimensions: { unit: "cm" },
      recipient: { name: "", email: "" },
      locationFrom: { address: "", city: "" },
      locationTo: { address: "", city: "" },
    },
  });

  const onSubmit = handleSubmit((values) => {
    const { dimensions } = values;
    const hasDimensions =
      dimensions.length != null ||
      dimensions.width != null ||
      dimensions.height != null;

    createParcel.mutate(
      {
        parcelType: values.parcelType,
        weight: values.weight,
        description: values.description || undefined,
        notes: values.notes || undefined,
        dimensions: hasDimensions ? dimensions : undefined,
        recipient: {
          name: values.recipient.name,
          email: values.recipient.email,
          phone: values.recipient.phone || undefined,
        },
        locationFrom: values.locationFrom,
        locationTo: values.locationTo,
      },
      {
        onSuccess: (parcel) => {
          enqueueSnackbar("Parcel created", { variant: "success" });
          navigate(`/parcels/${parcel._id}`);
        },
        onError: (error) =>
          enqueueSnackbar(getApiErrorMessage(error), { variant: "error" }),
      },
    );
  });

  return (
    <Box>
      <PageHeader
        title="New parcel"
        subtitle="Provide pickup, destination, and recipient details"
      />

      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={3}>
          <Section title="Parcel details">
            <Row>
              <TextField
                select
                label="Type"
                defaultValue="package"
                fullWidth
                error={Boolean(errors.parcelType)}
                helperText={errors.parcelType?.message}
                {...register("parcelType")}
              >
                {PARCEL_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {titleCase(t)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Weight (kg)"
                type="number"
                inputProps={{ step: "0.1", min: 0.1 }}
                fullWidth
                error={Boolean(errors.weight)}
                helperText={errors.weight?.message}
                {...register("weight")}
              />
            </Row>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register("description")}
            />
          </Section>

          <Section title="Dimensions (optional)">
            <Row>
              <TextField
                label="Length"
                type="number"
                fullWidth
                {...register("dimensions.length")}
              />
              <TextField
                label="Width"
                type="number"
                fullWidth
                {...register("dimensions.width")}
              />
              <TextField
                label="Height"
                type="number"
                fullWidth
                {...register("dimensions.height")}
              />
              <TextField
                select
                label="Unit"
                defaultValue="cm"
                sx={{ minWidth: 100 }}
                {...register("dimensions.unit")}
              >
                <MenuItem value="cm">cm</MenuItem>
                <MenuItem value="in">in</MenuItem>
              </TextField>
            </Row>
          </Section>

          <Section title="Recipient">
            <Row>
              <TextField
                label="Name"
                fullWidth
                error={Boolean(errors.recipient?.name)}
                helperText={errors.recipient?.name?.message}
                {...register("recipient.name")}
              />
              <TextField
                label="Email"
                fullWidth
                error={Boolean(errors.recipient?.email)}
                helperText={errors.recipient?.email?.message}
                {...register("recipient.email")}
              />
              <TextField
                label="Phone"
                fullWidth
                {...register("recipient.phone")}
              />
            </Row>
          </Section>

          <Section title="Pickup location">
            <LocationFields prefix="locationFrom" register={register} errors={errors} />
          </Section>

          <Section title="Destination">
            <LocationFields prefix="locationTo" register={register} errors={errors} />
          </Section>

          <Section title="Notes (optional)">
            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={2}
              {...register("notes")}
            />
          </Section>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              loading={createParcel.isPending}
            >
              Create parcel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={2}>{children}</Stack>
      </CardContent>
    </Card>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      {children}
    </Stack>
  );
}

function LocationFields({
  prefix,
  register,
  errors,
}: {
  prefix: "locationFrom" | "locationTo";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}) {
  const err = errors[prefix] ?? {};
  return (
    <Stack spacing={2}>
      <Row>
        <TextField
          label="Address"
          fullWidth
          error={Boolean(err.address)}
          helperText={err.address?.message}
          {...register(`${prefix}.address`)}
        />
        <TextField
          label="City"
          fullWidth
          error={Boolean(err.city)}
          helperText={err.city?.message}
          {...register(`${prefix}.city`)}
        />
      </Row>
      <Row>
        <TextField label="State" fullWidth {...register(`${prefix}.state`)} />
        <TextField
          label="Country"
          fullWidth
          {...register(`${prefix}.country`)}
        />
        <TextField
          label="Postal code"
          fullWidth
          {...register(`${prefix}.postalCode`)}
        />
      </Row>
    </Stack>
  );
}
