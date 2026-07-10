import { Chip, type ChipProps } from "@mui/material";
import type { ParcelStatus, PaymentStatus } from "@/types/api";
import { PAYMENT_COLOR, STATUS_COLOR, titleCase } from "@/utils/format";

interface StatusChipProps extends Omit<ChipProps, "color" | "label"> {
  status: ParcelStatus;
}

export function StatusChip({ status, ...rest }: StatusChipProps) {
  return (
    <Chip
      size="small"
      variant="filled"
      color={STATUS_COLOR[status]}
      label={titleCase(status)}
      {...rest}
    />
  );
}

interface PaymentChipProps extends Omit<ChipProps, "color" | "label"> {
  status: PaymentStatus;
}

export function PaymentChip({ status, ...rest }: PaymentChipProps) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={PAYMENT_COLOR[status]}
      label={titleCase(status)}
      {...rest}
    />
  );
}
