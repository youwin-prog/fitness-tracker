import { z } from "zod";

export const mealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);

export const nutritionFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Meal name is required"),
  type: mealTypeSchema,
  calories: z.coerce.number().int().nonnegative("Calories must be zero or greater"),
  proteinGrams: z.coerce.number().nonnegative("Protein must be zero or greater"),
  carbsGrams: z.coerce.number().nonnegative("Carbs must be zero or greater"),
  fatGrams: z.coerce.number().nonnegative("Fat must be zero or greater"),
  eatenAt: z.string().min(1, "Date and time is required"),
});

export type NutritionFormValues = z.infer<typeof nutritionFormSchema>;
