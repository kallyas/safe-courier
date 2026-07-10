import { z } from "zod";

const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z.array(z.number()).length(2).optional(),
});

const recipientSchema = z.object({
  name: z
    .string()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100, "Recipient name cannot exceed 100 characters"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{8,15}$/, "Please provide a valid phone number")
    .optional(),
  email: z.string().email("Please provide a valid recipient email address"),
});

const dimensionsSchema = z.object({
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  unit: z.enum(["cm", "in"]).default("cm"),
});

const parcelTypeSchema = z.enum([
  "document",
  "package",
  "fragile",
  "perishable",
  "electronics",
  "other",
]);

const statusSchema = z.enum([
  "pending",
  "processing",
  "in-transit",
  "on-hold",
  "delivered",
  "returned",
  "cancelled",
]);

const paymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);

export const createParcelSchema = z.object({
  parcelType: parcelTypeSchema,
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  weight: z
    .number({ invalid_type_error: "Weight is required" })
    .min(0.1, "Weight must be at least 0.1 kg")
    .max(1000, "Weight cannot exceed 1000 kg"),
  dimensions: dimensionsSchema.optional(),
  status: statusSchema.optional(),
  locationFrom: locationSchema,
  locationTo: locationSchema,
  presentLocation: locationSchema.optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  recipient: recipientSchema,
});

export const updateDestinationSchema = z.object({
  locationTo: locationSchema,
});

export const updatePresentLocationSchema = z.object({
  presentLocation: locationSchema,
});

export const updateStatusSchema = z
  .object({
    status: statusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: "Provide a status or paymentStatus to update",
  });

export const assignCourierSchema = z.object({
  courierId: z.string().min(1, "Courier ID is required"),
});

export type CreateParcelInput = z.infer<typeof createParcelSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type UpdatePresentLocationInput = z.infer<
  typeof updatePresentLocationSchema
>;
export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
