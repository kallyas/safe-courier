import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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

const schema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof schema>;

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token);
      navigate(from, { replace: true });
    },
    onError: (error) =>
      enqueueSnackbar(getApiErrorMessage(error), { variant: "error" }),
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage and track your parcels"
      footer={
        <Typography variant="body2" color="text.secondary">
          New here?{" "}
          <Link component={RouterLink} to="/signup">
            Create an account
          </Link>
        </Typography>
      }
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="Username or email"
            autoComplete="username"
            autoFocus
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register("username")}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register("password")}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={mutation.isPending}
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
