import { z } from "zod";

export const waterEntrySchema = z.object({
  id: z.string().optional(),
  amountMl: z.coerce.number().int().positive("Water amount must be greater than zero"),
  takenAt: z.string().min(1, "Date and time is required"),
});

export const waterGoalSchema = z.object({
  goalMl: z.coerce.number().int().positive("Daily goal must be greater than zero"),
});

export type WaterEntryFormValues = z.infer<typeof waterEntrySchema>;
export type WaterGoalFormValues = z.infer<typeof waterGoalSchema>;