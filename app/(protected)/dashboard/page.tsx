import { Dumbbell, Flame, HeartPulse, Salad, TimerReset, Trophy } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getGoalModuleData } from "@/actions/goal-actions";
import { getMealEntries } from "@/actions/nutrition-actions";
import { getSleepModuleData } from "@/actions/sleep-actions";
import { getWorkoutSessions } from "@/actions/workout-actions";

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getStartOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfWeek(date: Date) {
  const start = getStartOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function isSameDay(left: Date, right: Date) {
  return getDateKey(left) === getDateKey(right);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getWorkoutStreak(workoutDates: Set<string>) {
  if (workoutDates.size === 0) {
    return 0;
  }

  const sortedDates = [...workoutDates].sort().reverse();
  let streak = 0;
  const cursor = new Date(`${sortedDates[0]}T00:00:00`);

  for (const dateKey of sortedDates) {
    if (getDateKey(cursor) !== dateKey) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getChangeLabel(current: number, previous: number, unit = "") {
  if (current === 0 && previous === 0) {
    return "No data yet";
  }

  if (previous === 0) {
    return `New ${unit} this week`.trim();
  }

  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : ""}${change}% vs last week`;
}

export default async function DashboardPage() {
  const [user, workouts, meals, goalData, sleepData] = await Promise.all([
    currentUser(),
    getWorkoutSessions(),
    getMealEntries(),
    getGoalModuleData(),
    getSleepModuleData(),
  ]);
  const displayName = user?.firstName || user?.fullName || "there";
  const now = new Date();
  const today = getStartOfDay(now);
  const thisWeekStart = getStartOfWeek(now);
  const previousWeekStart = new Date(thisWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const thisWeekWorkouts = workouts.filter((workout) => new Date(workout.startedAt) >= thisWeekStart);
  const previousWeekWorkouts = workouts.filter((workout) => {
    const startedAt = new Date(workout.startedAt);
    return startedAt >= previousWeekStart && startedAt < thisWeekStart;
  });
  const thisWeekCalories = thisWeekWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned ?? 0), 0);
  const previousWeekCalories = previousWeekWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned ?? 0), 0);
  const thisWeekMinutes = thisWeekWorkouts.reduce((sum, workout) => sum + (workout.durationMinutes ?? 0), 0);
  const previousWeekMinutes = previousWeekWorkouts.reduce((sum, workout) => sum + (workout.durationMinutes ?? 0), 0);
  const workoutDates = new Set(workouts.map((workout) => getDateKey(new Date(workout.startedAt))));
  const completedGoals = goalData.goals.filter((goal) => goal.status === "COMPLETED").length;
  const sleepThisWeek = sleepData.entries.filter((entry) => new Date(entry.recordedAt) >= thisWeekStart);
  const averageSleepHours = sleepThisWeek.length
    ? sleepThisWeek.reduce((sum, entry) => sum + entry.sleepHours, 0) / sleepThisWeek.length
    : 0;
  const activityCounts = {
    STRENGTH: thisWeekWorkouts.filter((workout) => workout.type === "STRENGTH").length,
    CARDIO: thisWeekWorkouts.filter((workout) => workout.type === "CARDIO").length,
    MOBILITY: thisWeekWorkouts.filter((workout) => workout.type === "MOBILITY").length,
  };
  const totalActivityWorkouts = Object.values(activityCounts).reduce((sum, value) => sum + value, 0);
  const activity = [
    { label: "Strength", value: totalActivityWorkouts ? Math.round((activityCounts.STRENGTH / totalActivityWorkouts) * 100) : 0 },
    { label: "Cardio", value: totalActivityWorkouts ? Math.round((activityCounts.CARDIO / totalActivityWorkouts) * 100) : 0 },
    { label: "Mobility", value: totalActivityWorkouts ? Math.round((activityCounts.MOBILITY / totalActivityWorkouts) * 100) : 0 },
    { label: "Sleep", value: Math.min(100, Math.round((averageSleepHours / 8) * 100)) },
  ];
  const todayPlan = [
    ...workouts
      .filter((workout) => isSameDay(new Date(workout.startedAt), today))
      .map((workout) => ({
        title: workout.title,
        detail: `${workout.type.toLowerCase()} workout${workout.durationMinutes ? ` · ${workout.durationMinutes} min` : ""}`,
        time: formatTime(new Date(workout.startedAt)),
        icon: Dumbbell,
      })),
    ...meals
      .filter((meal) => isSameDay(new Date(meal.eatenAt), today))
      .map((meal) => ({
        title: meal.name,
        detail: `${meal.type.toLowerCase()} · ${meal.calories} kcal`,
        time: formatTime(new Date(meal.eatenAt)),
        icon: Salad,
      })),
    ...goalData.goals
      .filter((goal) => goal.status !== "COMPLETED" && goal.targetDate && isSameDay(new Date(goal.targetDate), today))
      .map((goal) => ({
        title: goal.title,
        detail: "Goal due today",
        time: "Today",
        icon: Trophy,
      })),
  ].slice(0, 3);
  const recoveryScore = sleepThisWeek.length ? Math.min(100, Math.round((averageSleepHours / 8) * 100)) : null;
  const recoveryLabel = recoveryScore === null ? "No sleep data" : recoveryScore >= 85 ? "Excellent" : recoveryScore >= 70 ? "Good" : "Needs attention";
  const stats = [
    { label: "Workout streak", value: `${getWorkoutStreak(workoutDates)} days`, change: "Consecutive workout days", icon: Flame },
    { label: "Calories burned", value: thisWeekCalories.toLocaleString(), change: getChangeLabel(thisWeekCalories, previousWeekCalories, "calories"), icon: HeartPulse },
    { label: "Active minutes", value: `${thisWeekMinutes} min`, change: getChangeLabel(thisWeekMinutes, previousWeekMinutes, "minutes"), icon: TimerReset },
    { label: "Goals completed", value: `${completedGoals}/${goalData.goals.length}`, change: goalData.goals.length ? `${Math.round((completedGoals / goalData.goals.length) * 100)}% completion` : "No goals yet", icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border-color bg-card dark:bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl dark:shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-red-200 dark:text-red-300">
              Today&apos;s overview
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-text-primary dark:text-white">
                Good to see you back, {displayName}.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary dark:text-slate-300 sm:text-base">
                Your training, nutrition, and recovery are aligned for a strong week. Keep your momentum going with the next session and today&apos;s recovery goals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/workout"
              className="inline-flex items-center justify-center rounded-full bg-red-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-red-300"
            >
              Start workout
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center justify-center rounded-full border border-border-color bg-card dark:bg-white/5 px-5 py-3 text-sm font-medium text-text-primary dark:text-white transition hover:bg-card/50 dark:hover:bg-white/10"
            >
              View plan
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20"
            >
              Workout analytics
            </Link>
            <Link
              href="/nutrition"
              className="inline-flex items-center justify-center rounded-full border border-salmon-400/20 bg-salmon-400/10 px-4 py-2 text-sm font-medium text-salmon-200 transition hover:bg-salmon-400/20"
            >
              Nutrition insights
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
            >
              Weekly goal progress
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-[1.75rem] border border-border-color dark:border-white/10 bg-card dark:bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-text-secondary dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-text-primary dark:text-white">{stat.value}</p>
                </div>
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 dark:text-red-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-secondary dark:text-slate-400">{stat.change}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className="space-y-6 rounded-[2rem] border border-border-color dark:border-white/10 bg-card dark:bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-red-200/80 dark:text-red-300/80">Weekly activity</p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary dark:text-white">Progress snapshot</h3>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              {getChangeLabel(thisWeekMinutes, previousWeekMinutes, "minutes")}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border-color dark:border-white/10 bg-card dark:bg-slate-950/60 p-5">
              <p className="text-sm text-text-secondary dark:text-slate-400">Activity balance</p>
              <div className="mt-5 space-y-4">
                {activity.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary dark:text-slate-300">{item.label}</span>
                      <span className="font-medium text-text-primary dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary/20 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border-color dark:border-white/10 bg-card dark:bg-slate-950/60 p-5">
              <p className="text-sm text-text-secondary dark:text-slate-400">Focus for today</p>
              <div className="mt-5 space-y-4">
                {todayPlan.length > 0 ? (
                  todayPlan.map((item) => (
                    <div key={`${item.title}-${item.time}`} className="flex gap-3 rounded-2xl border border-border-color dark:border-white/10 bg-card dark:bg-white/5 px-4 py-3">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-300" />
                      <p className="text-sm leading-6 text-text-secondary dark:text-slate-200">{item.title} · {item.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border-color dark:border-white/10 bg-card dark:bg-white/5 px-4 py-3">
                    <p className="text-sm leading-6 text-text-secondary dark:text-slate-200">No workouts, meals, or goals scheduled for today.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-border-color dark:border-white/10 bg-card dark:bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-red-200/80 dark:text-red-300/80">Today&apos;s schedule</p>
            <h3 className="mt-2 text-xl font-semibold text-text-primary dark:text-white">Planned sessions</h3>
          </div>

          <div className="space-y-3">
            {todayPlan.length > 0 ? (
              todayPlan.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={`${item.title}-${item.time}`} className="flex items-start gap-4 rounded-[1.5rem] border border-border-color dark:border-white/10 bg-card dark:bg-slate-950/60 p-4">
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 dark:text-red-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-medium text-text-primary dark:text-white">{item.title}</h4>
                        <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-text-secondary dark:text-slate-400">{item.time}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-text-secondary dark:text-slate-300">{item.detail}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-border-color dark:border-white/10 bg-card dark:bg-slate-950/60 p-4">
                <p className="text-sm leading-6 text-text-secondary dark:text-slate-300">No planned items for today.</p>
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-border-color dark:border-white/10 bg-gradient-to-br from-red-400/10 to-red-500/10 p-5">
            <p className="text-sm text-text-secondary dark:text-slate-300">Recovery score</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-text-primary dark:text-white">{recoveryScore ?? "--"}</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">{recoveryScore === null ? "Log sleep to track recovery" : "Based on this week&apos;s sleep"}</p>
              </div>
              <div className="rounded-full border border-border-color dark:border-white/10 bg-card dark:bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-red-100 dark:text-red-200">
                {recoveryLabel}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}