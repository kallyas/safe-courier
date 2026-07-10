import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { getApiErrorMessage } from "@/lib/apiClient";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = "Couldn't load this",
}: ErrorStateProps) {
  return (
    <Stack spacing={2} sx={{ my: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {getApiErrorMessage(error)}
      </Alert>
    </Stack>
  );
}
