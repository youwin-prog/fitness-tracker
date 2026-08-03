export type NutritionMealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type NutritionMealRecord = {
  id: string;
  name: string;
  type: NutritionMealType;
  calories: number;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  eatenAt: string;
};
