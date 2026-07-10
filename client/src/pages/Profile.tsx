import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { z } from "zod";
import {
  useChangePassword,
  useProfile,
  useUpdateUser,
} from "@/api/users";
import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import { ErrorState } from "@/components/ErrorState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatDate, titleCase } from "@/utils/format";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Include an uppercase letter, a lowercase letter, and a number",
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { claims } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const profile = useProfile();
  const userId = claims?.id ?? "";

  const updateUser = useUpdateUser(userId);
  const changePassword = useChangePassword(userId);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (profile.data) {
      profileForm.reset({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
        email: profile.data.email,
      });
    }
  }, [profile.data, profileForm]);

  if (profile.isLoading) return <Loader />;
  if (profile.isError || !profile.data)
    return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;

  const user = profile.data;

  const saveProfile = profileForm.handleSubmit((values) =>
    updateUser.mutate(values, {
      onSuccess: () => enqueueSnackbar("Profile updated", { variant: "success" }),
      onError: (e) =>
        enqueueSnackbar(getApiErrorMessage(e), { variant: "error" }),
    }),
  );

  const savePassword = passwordForm.handleSubmit((values) =>
    changePassword.mutate(values, {
      onSuccess: () => {
        enqueueSnackbar("Password changed", { variant: "success" });
        passwordForm.reset();
      },
      onError: (e) =>
        enqueueSnackbar(getApiErrorMessage(e), { variant: "error" }),
    }),
  );

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Manage your account details" />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {user.username}
              </Typography>
              <Chip label={titleCase(user.role)} color="primary" size="small" />
              <Chip label={titleCase(user.status)} size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Member since {formatDate(user.createdAt)}
            </Typography>

            <form onSubmit={saveProfile} noValidate>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="First name"
                    fullWidth
                    error={Boolean(profileForm.formState.errors.firstName)}
                    helperText={profileForm.formState.errors.firstName?.message}
                    {...profileForm.register("firstName")}
                  />
                  <TextField
                    label="Last name"
                    fullWidth
                    error={Boolean(profileForm.formState.errors.lastName)}
                    helperText={profileForm.formState.errors.lastName?.message}
                    {...profileForm.register("lastName")}
                  />
                </Stack>
                <TextField
                  label="Email"
                  type="email"
                  error={Boolean(profileForm.formState.errors.email)}
                  helperText={profileForm.formState.errors.email?.message}
                  {...profileForm.register("email")}
                />
                <Box sx={{ textAlign: "right" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    loading={updateUser.isPending}
                  >
                    Save changes
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Change password
            </Typography>
            <form onSubmit={savePassword} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  error={Boolean(passwordForm.formState.errors.currentPassword)}
                  helperText={
                    passwordForm.formState.errors.currentPassword?.message
                  }
                  {...passwordForm.register("currentPassword")}
                />
                <TextField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  error={Boolean(passwordForm.formState.errors.newPassword)}
                  helperText={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register("newPassword")}
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  error={Boolean(passwordForm.formState.errors.confirmPassword)}
                  helperText={
                    passwordForm.formState.errors.confirmPassword?.message
                  }
                  {...passwordForm.register("confirmPassword")}
                />
                <Box sx={{ textAlign: "right" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    loading={changePassword.isPending}
                  >
                    Update password
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
