"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Apple, Beef, CookingPot, PencilLine, Plus, Trash2 } from "lucide-react";
import { createMeal, deleteMeal, updateMeal } from "@/actions/nutrition-actions";
import { nutritionFormSchema, type NutritionFormValues } from "@/lib/nutrition-schema";
import type { NutritionMealRecord } from "@/types/nutrition";

type NutritionCrudProps = {
  meals: NutritionMealRecord[];
};

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Apple }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MealRow({
  meal,
  onEdit,
  onDelete,
  isSelected,
}: {
  meal: NutritionMealRecord;
  onEdit: (meal: NutritionMealRecord) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}) {
  return (
    <div className={`rounded-[1.5rem] border p-5 ${isSelected ? "border-cyan-400/30 bg-cyan-400/5" : "border-white/10 bg-slate-950/60"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/80">
              {meal.type}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{new Date(meal.eatenAt).toLocaleString()}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">{meal.name}</h4>
            <p className="mt-1 text-sm text-slate-300">{meal.calories} kcal</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            <p>Protein: {meal.proteinGrams} g</p>
            <p>Carbs: {meal.carbsGrams} g</p>
            <p>Fat: {meal.fatGrams} g</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(meal)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal.id)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function NutritionCrud({ meals }: NutritionCrudProps) {
  const router = useRouter();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(meals[0]?.id ?? null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.id === selectedMealId) ?? null,
    [meals, selectedMealId],
  );

  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "BREAKFAST",
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      eatenAt: "",
    },
  });

  useEffect(() => {
    if (selectedMeal) {
      form.reset({
        id: selectedMeal.id,
        name: selectedMeal.name,
        type: selectedMeal.type,
        calories: selectedMeal.calories,
        proteinGrams: Number(selectedMeal.proteinGrams),
        carbsGrams: Number(selectedMeal.carbsGrams),
        fatGrams: Number(selectedMeal.fatGrams),
        eatenAt: new Date(selectedMeal.eatenAt).toISOString().slice(0, 16),
      });
      return;
    }

    form.reset({
      id: "",
      name: "",
      type: "BREAKFAST",
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      eatenAt: "",
    });
  }, [form, selectedMeal]);

  const totals = useMemo(
    () => ({
      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: meals.reduce((sum, meal) => sum + Number(meal.proteinGrams), 0),
      carbs: meals.reduce((sum, meal) => sum + Number(meal.carbsGrams), 0),
      fat: meals.reduce((sum, meal) => sum + Number(meal.fatGrams), 0),
    }),
    [meals],
  );

  const handleEdit = (meal: NutritionMealRecord) => {
    setServerMessage(null);
    setSelectedMealId(meal.id);
  };

  const handleDelete = (id: string) => {
    setServerMessage(null);

    startTransition(async () => {
      const result = await deleteMeal(id);
      setServerMessage(result.message ?? null);
      setSelectedMealId((current) => (current === id ? null : current));
      router.refresh();
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerMessage(null);

    startTransition(async () => {
      const payload = {
        ...values,
        id: selectedMeal ? selectedMeal.id : undefined,
      };

      const result = selectedMeal ? await updateMeal(payload) : await createMeal(payload);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0] && key in payload) {
            form.setError(key as keyof NutritionFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setServerMessage(result.message);
      }

      if (!result.errors) {
        if (!selectedMeal) {
          form.reset({
            id: "",
            name: "",
            type: "BREAKFAST",
            calories: 0,
            proteinGrams: 0,
            carbsGrams: 0,
            fatGrams: 0,
            eatenAt: "",
          });
        }

        setSelectedMealId(null);
        router.refresh();
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Nutrition module
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Track meals with precision and consistency.</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Add, edit, and manage meals with a premium dark interface built for the rest of the fitness tracker.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetricCard label="Meals logged" value={String(meals.length)} icon={CookingPot} />
            <MetricCard label="Protein total" value={`${totals.protein.toFixed(0)} g`} icon={Beef} />
            <MetricCard label="Calories total" value={`${totals.calories} kcal`} icon={Apple} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                {selectedMeal ? "Edit meal" : "Add meal"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedMeal ? "Update nutrition entry" : "Log a new meal"}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {isPending ? "Saving" : selectedMeal ? "Editing" : "Creating"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input type="hidden" {...form.register("id")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Meal name</span>
                <input
                  {...form.register("name")}
                  placeholder="Grilled chicken bowl"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
                {form.formState.errors.name ? <p className="text-xs text-rose-300">{form.formState.errors.name.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Meal type</span>
                <select
                  {...form.register("type")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </select>
                {form.formState.errors.type ? <p className="text-xs text-rose-300">{form.formState.errors.type.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Date and time</span>
                <input
                  {...form.register("eatenAt")}
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.eatenAt ? <p className="text-xs text-rose-300">{form.formState.errors.eatenAt.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Calories</span>
                <input
                  {...form.register("calories")}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.calories ? <p className="text-xs text-rose-300">{form.formState.errors.calories.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Protein (g)</span>
                <input
                  {...form.register("proteinGrams")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.proteinGrams ? <p className="text-xs text-rose-300">{form.formState.errors.proteinGrams.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Carbs (g)</span>
                <input
                  {...form.register("carbsGrams")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.carbsGrams ? <p className="text-xs text-rose-300">{form.formState.errors.carbsGrams.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Fat (g)</span>
                <input
                  {...form.register("fatGrams")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.fatGrams ? <p className="text-xs text-rose-300">{form.formState.errors.fatGrams.message}</p> : null}
              </label>
            </div>

            {serverMessage ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{serverMessage}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {selectedMeal ? "Update meal" : "Create meal"}
              </button>
              {selectedMeal ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMealId(null);
                    form.reset({
                      id: "",
                      name: "",
                      type: "BREAKFAST",
                      calories: 0,
                      proteinGrams: 0,
                      carbsGrams: 0,
                      fatGrams: 0,
                      eatenAt: "",
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New entry
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Meal log</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent meals</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {meals.length} total
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {meals.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                No meals logged yet. Add the first nutrition entry to start tracking.
              </div>
            ) : (
              meals.map((meal) => (
                <MealRow
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSelected={selectedMealId === meal.id}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
