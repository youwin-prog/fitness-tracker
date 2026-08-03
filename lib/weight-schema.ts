import { z } from "zod";

export const weightEntrySchema = z.object({
  id: z.string().optional(),
  weightKg: z.coerce.number().positive("Weight must be greater than zero"),
  recordedAt: z.string().min(1, "Date and time is required"),
});

export type WeightEntryFormValues = z.infer<typeof weightEntrySchema>;
