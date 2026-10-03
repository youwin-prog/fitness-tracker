import { getMealEntries } from "@/actions/nutrition-actions";
import { NutritionCrud } from "@/components/nutrition-crud";
import type { NutritionMealRecord } from "@/types/nutrition";

export default async function NutritionPage() {
  const meals = await getMealEntries();

  const serializedMeals: NutritionMealRecord[] = meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    type: meal.type,
    calories: meal.calories,
    proteinGrams: (meal.proteinGrams ?? 0).toString(),
    carbsGrams: (meal.carbsGrams ?? 0).toString(),
    fatGrams: (meal.fatGrams ?? 0).toString(),
    eatenAt: meal.eatenAt.toISOString(),
  }));

  return <NutritionCrud meals={serializedMeals} />;
}