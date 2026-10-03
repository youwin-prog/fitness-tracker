import { z } from "zod";

export const genderSchema = z.enum(["PREFER_NOT_TO_SAY", "FEMALE", "MALE", "NON_BINARY"]);
export const activityLevelSchema = z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]);
export const fitnessGoalSchema = z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "MAINTAIN_HEALTH", "IMPROVE_ENDURANCE"]);

const optionalNumericField = (schema: z.ZodTypeAny) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    schema.optional(),
  );

export const profileFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  profileImageUrl: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().url("Enter a valid image URL").optional(),
  ),
  age: optionalNumericField(z.coerce.number().int().positive("Age must be greater than zero").max(120, "Age looks too high")),
  heightCm: optionalNumericField(z.coerce.number().int().positive("Height must be greater than zero").max(300, "Height looks too high")),
  currentWeightKg: optionalNumericField(z.coerce.number().positive("Weight must be greater than zero").max(1000, "Weight looks too high")),
  gender: genderSchema.optional(),
  activityLevel: activityLevelSchema.optional(),
  fitnessGoal: fitnessGoalSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;