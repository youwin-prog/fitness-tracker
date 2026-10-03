import { getWorkoutSessions } from "@/actions/workout-actions";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";

interface WorkoutSession {
  startedAt: Date;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const days = [];

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const key = `${year}-${String(month - 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      key,
      date: d,
      isCurrentMonth: false,
      dayOfWeek: new Date(year, month - 2, d).toLocaleString("en-US", { weekday: "short" }),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      key,
      date: d,
      isCurrentMonth: true,
      dayOfWeek: new Date(year, month - 1, d).toLocaleString("en-US", { weekday: "short" }),
    });
  }

  // Next month's leading days
  const totalCells = days.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const key = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      key,
      date: d,
      isCurrentMonth: false,
      dayOfWeek: new Date(nextYear, nextMonth - 1, d).toLocaleString("en-US", { weekday: "short" }),
    });
  }

  return days;
}

function getWorkoutKeys(workouts: WorkoutSession[]) {
  const keys = new Set<string>();
  workouts.forEach((session) => {
    const startedAt = new Date(session.startedAt);
    const key = `${startedAt.getFullYear()}-${String(startedAt.getMonth() + 1).padStart(2, "0")}-${String(startedAt.getDate()).padStart(2, "0")}`;
    keys.add(key);
  });
  return keys;
}

export default async function CalendarPage() {
  const workouts = await getWorkoutSessions();
  const workoutKeys = getWorkoutKeys(workouts);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const days = getMonthDays(year, month);

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-red-600 dark:text-red-300" />
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Calendar</h1>
          </div>

          <div className="flex items-center gap-2 sm:mt-0 sm:w-auto">
            <Link
              href="/workout"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
            >
              New workout
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dow) => (
            <div key={dow} className="py-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
              {dow}
            </div>
          ))}
          {days.map((day) => {
            const hasWorkout = workoutKeys.has(day.key);
            return (
              <div
                key={day.key}
                className={`flex aspect-square flex-col rounded-xl border border-border bg-card p-2 backdrop-blur-xl ${
                  day.isCurrentMonth
                    ? "transition-colors hover:border-red-400/30 hover:bg-secondary/70"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <span className={`text-sm font-medium ${day.isCurrentMonth ? "text-text-primary" : "text-text-secondary"}`}>
                  {day.date}
                </span>
                {hasWorkout && (
                  <span className="mt-auto rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-red-600 dark:text-red-300">
                    Session
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-6 backdrop-blur-xl">
          <h2 className="mb-4 font-medium text-text-primary">This month</h2>
          <p className="text-text-secondary">
            {workouts.length} planned workout{workouts.length !== 1 ? "s" : ""}
            {workoutKeys.size > 0 ? ` across ${workoutKeys.size} day${workoutKeys.size > 1 ? "s" : ""}` : ""}
            this month.
          </p>
          <Link
            href="/workout"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-500 dark:text-red-300 dark:hover:text-red-200"
          >
            View all sessions
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}