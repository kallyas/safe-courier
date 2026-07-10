import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { ParcelStatus, PaymentStatus } from "@/types/api";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export const STATUS_COLOR: Record<ParcelStatus, ChipColor> = {
  pending: "default",
  processing: "info",
  "in-transit": "primary",
  "on-hold": "warning",
  delivered: "success",
  returned: "secondary",
  cancelled: "error",
};

export const PAYMENT_COLOR: Record<PaymentStatus, ChipColor> = {
  pending: "warning",
  paid: "success",
  failed: "error",
  refunded: "info",
};

export const PARCEL_STATUSES: ParcelStatus[] = [
  "pending",
  "processing",
  "in-transit",
  "on-hold",
  "delivered",
  "returned",
  "cancelled",
];

export const PARCEL_TYPES = [
  "document",
  "package",
  "fragile",
  "perishable",
  "electronics",
  "other",
] as const;

export function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso?: string, pattern = "PP"): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(iso?: string): string {
  return formatDate(iso, "PPp");
}

export function formatRelative(iso?: string): string {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatLocation(
  location?: { city?: string; country?: string },
): string {
  if (!location) return "—";
  return [location.city, location.country].filter(Boolean).join(", ") || "—";
}
