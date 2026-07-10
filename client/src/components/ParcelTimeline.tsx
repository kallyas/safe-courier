import {
  Alert,
  Box,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import type { ParcelStatus } from "@/types/api";
import { titleCase } from "@/utils/format";

const FLOW: ParcelStatus[] = [
  "pending",
  "processing",
  "in-transit",
  "delivered",
];

interface ParcelTimelineProps {
  status: ParcelStatus;
  progress: number;
}

export function ParcelTimeline({ status, progress }: ParcelTimelineProps) {
  if (status === "cancelled" || status === "returned" || status === "on-hold") {
    const severity =
      status === "on-hold" ? "warning" : status === "returned" ? "info" : "error";
    return (
      <Box>
        <Alert severity={severity} sx={{ mb: 2, borderRadius: 2 }}>
          This parcel is <strong>{titleCase(status)}</strong>.
        </Alert>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={severity === "error" ? "error" : "warning"}
          sx={{ borderRadius: 1, height: 6 }}
        />
      </Box>
    );
  }

  const activeStep = FLOW.indexOf(status);

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 2,
          overflowX: "auto",
          "& .MuiStepLabel-label": {
            fontWeight: 500,
            fontSize: "0.8125rem",
          },
          "& .Mui-completed .MuiStepLabel-label": {
            color: "success.main",
          },
        }}
      >
        {FLOW.map((step) => (
          <Step key={step} completed={FLOW.indexOf(step) <= activeStep}>
            <StepLabel>{titleCase(step)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ borderRadius: 1, height: 6 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
        {progress}% complete
      </Typography>
    </Box>
  );
}
