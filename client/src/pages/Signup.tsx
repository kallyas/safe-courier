import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";
import { authApi } from "@/auth/authApi";
import { useAuth } from "@/auth/useAuth";
import { getApiErrorMessage } from "@/lib/apiClient";
import { AuthLayout } from "@/components/layout/AuthLayout";

// Mirrors the backend's signup validation so users get instant feedback.
const schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Include an uppercase letter, a lowercase letter, and a number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof schema>;

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      login(data.token);
      enqueueSnackbar("Account created", { variant: "success" });
      navigate("/dashboard", { replace: true });
    },
    onError: (error) =>
      enqueueSnackbar(getApiErrorMessage(error), { variant: "error" }),
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start sending and tracking parcels in minutes"
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      }
    >
      <form
        onSubmit={handleSubmit((v) =>
          mutation.mutate({
            firstName: v.firstName,
            lastName: v.lastName,
            username: v.username,
            email: v.email,
            password: v.password,
          }),
        )}
        noValidate
      >
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First name"
              fullWidth
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              {...register("firstName")}
            />
            <TextField
              label="Last name"
              fullWidth
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
              {...register("lastName")}
            />
          </Stack>
          <TextField
            label="Username"
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register("username")}
          />
          <TextField
            label="Email"
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register("password")}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={mutation.isPending}
          >
            Create account
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
