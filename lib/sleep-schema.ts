import { z } from "zod";

export const sleepEntrySchema = z.object({
  id: z.string().optional(),
  sleepHours: z.coerce.number().positive("Sleep duration must be greater than zero"),
  quality: z.coerce.number().int().min(1, "Quality must be between 1 and 5").max(5, "Quality must be between 1 and 5"),
  recordedAt: z.string().min(1, "Date and time is required"),
});

export type SleepEntryFormValues = z.infer<typeof sleepEntrySchema>;
