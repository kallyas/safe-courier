import { z } from "zod";

export const advancedSearchSchema = z.object({
  type: z.enum(["users", "parcels"]).default("parcels"),
  query: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  parcelType: z.string().optional(),
  weight: z.string().optional(),
  city: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type AdvancedSearchInput = z.infer<typeof advancedSearchSchema>;
