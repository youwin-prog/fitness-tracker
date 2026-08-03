import { z } from "zod";

export const goalStatusSchema = z.enum(["ACTIVE", "COMPLETED"]);

export const goalFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  description: z.string().max(500).optional().or(z.literal("")),
  targetValue: z.coerce.number().positive("Target value must be greater than zero"),
  currentValue: z.coerce.number().nonnegative("Current progress must be zero or greater"),
  targetDate: z.string().optional().or(z.literal("")),
  status: goalStatusSchema,
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
