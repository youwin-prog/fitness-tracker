import { Apple, Beef, CookingPot, Salad, Sparkles, TimerReset, Utensils } from "lucide-react";
import Link from "next/link";

const nutritionStats = [
  { label: "Calories eaten", value: "1,840 kcal", icon: CookingPot },
  { label: "Protein", value: "148 g", icon: Beef },
  { label: "Hydration", value: "2.4 L", icon: TimerReset },
  { label: "Meal score", value: "94", icon: Sparkles },
];

const meals = [
  {
    name: "Breakfast",
    time: "7:30 AM",
    items: ["Greek yogurt", "Oats", "Blueberries", "Honey"],
    focus: "High protein start",
  },
  {
    name: "Lunch",
    time: "12:45 PM",
    items: ["Grilled chicken", "Brown rice", "Roasted vegetables", "Avocado"],
    focus: "Balanced recovery meal",
  },
  {
    name: "Dinner",
    time: "7:15 PM",
    items: ["Salmon", "Sweet potato", "Spinach", "Olive oil"],
    focus: "Omega-rich reset",
  },
];

const macros = [
  { label: "Protein", value: 88 },
  { label: "Carbs", value: 63 },
  { label: "Fats", value: 71 },
  { label: "Fiber", value: 54 },
];

const habits = [
  "Hit protein target before dinner",
  "Keep water intake above 3 liters",
  "Prioritize whole foods for the final meal",
];

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Nutrition overview
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Clean meals, better recovery, stronger output.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Track your daily nutrition with a simple premium layout built for performance, consistency, and long-term habit building.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Back to dashboard
            </Link>
            <Link
              href="/workout"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View workout
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {nutritionStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Meal plan</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Today&apos;s meals</h3>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              On target
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {meals.map((meal) => (
              <div key={meal.name} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-white">{meal.name}</h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{meal.time}</p>
                  </div>
                  <Salad className="h-5 w-5 text-cyan-300" />
                </div>
                <p className="mt-4 text-sm font-medium text-cyan-200">{meal.focus}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {meal.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-6">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Macro balance</p>
                <h4 className="mt-1 text-lg font-semibold text-white">Daily split</h4>
              </div>
              <Apple className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 space-y-4">
              {macros.map((macro) => (
                <div key={macro.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{macro.label}</span>
                    <span className="font-medium text-white">{macro.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
                      style={{ width: `${macro.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Daily habits</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Nutrition priorities</h3>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Hydration</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">2.4L</p>
              </div>
              <TimerReset className="h-6 w-6 text-cyan-300" />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Keep water intake steady through the day and add electrolytes if your workout volume increases.
            </p>
          </div>

          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            {habits.map((habit) => (
              <div key={habit} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="text-sm leading-6 text-slate-200">{habit}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-5">
            <p className="text-sm text-slate-300">Meal prep focus</p>
            <h4 className="mt-1 text-lg font-semibold text-white">Cook once, eat well all week</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Batch cooking keeps your nutrition consistent while reducing decision fatigue on busy training days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}