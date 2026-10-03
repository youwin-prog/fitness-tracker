"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";

type CalendarWorkout = {
  id: string;
  startedAt: string;
};

type CalendarClientProps = {
  workouts: CalendarWorkout[];
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = firstDay + daysInMonth;
  const cellCount = totalCells + ((7 - (totalCells % 7)) % 7);
  const firstGridDate = new Date(year, month, 1 - firstDay);

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);

    return {
      key: getDateKey(date),
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
    };
  });
}

function getWorkoutsByDate(workouts: CalendarWorkout[]) {
  const sessionsByDate = new Map<string, CalendarWorkout[]>();

  workouts.forEach((session) => {
    const key = getDateKey(new Date(session.startedAt));
    const sessions = sessionsByDate.get(key) ?? [];
    sessions.push(session);
    sessionsByDate.set(key, sessions);
  });

  return sessionsByDate;
}

export function CalendarClient({ workouts }: CalendarClientProps) {
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const workoutsByDate = useMemo(() => getWorkoutsByDate(workouts), [workouts]);
  const days = getMonthDays(displayedMonth);
  const monthWorkouts = workouts.filter((workout) => {
    const date = new Date(workout.startedAt);
    return date.getFullYear() === displayedMonth.getFullYear() && date.getMonth() === displayedMonth.getMonth();
  });
  const monthWorkoutDates = new Set(monthWorkouts.map((workout) => getDateKey(new Date(workout.startedAt))));
  const monthLabel = displayedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const changeMonth = (amount: number) => {
    setDisplayedMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1));
  };

  return (
    <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-7xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Calendar</h1>
              <p className="mt-1 text-sm text-text-secondary">{monthLabel}</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-primary transition hover:border-red-400/40 hover:bg-secondary/70"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-primary transition hover:border-red-400/40 hover:bg-secondary/70"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/workout"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
            >
              New workout
            </Link>
          </div>
        </header>

        <div className="hidden min-w-0 grid-cols-7 gap-1 md:grid">
          {weekdayLabels.map((weekday) => (
            <div key={weekday} className="min-w-0 py-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
              {weekday}
            </div>
          ))}
          {days.map((day) => {
            const sessions = workoutsByDate.get(day.key) ?? [];
            return (
              <div
                key={day.key}
                className={`flex min-w-0 aspect-square flex-col rounded-xl border border-border bg-card p-2 backdrop-blur-xl ${
                  day.isCurrentMonth || sessions.length > 0
                    ? "transition-colors hover:border-red-400/30 hover:bg-secondary/70"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <span className={`text-sm font-medium ${day.isCurrentMonth ? "text-text-primary" : "text-text-secondary"}`}>
                  {day.date}
                </span>
                {sessions.length > 0 && (
                  <div className="mt-auto min-w-0 space-y-1">
                    {sessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/workout?sessionId=${encodeURIComponent(session.id)}`}
                        className="block truncate rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-500/20 dark:text-red-300"
                      >
                        Session
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 md:hidden">
          {days
            .filter((day) => day.isCurrentMonth)
            .map((day) => {
              const sessions = workoutsByDate.get(day.key) ?? [];

              return (
                <div key={day.key} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(`${day.key}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {sessions.length === 0 ? "No sessions" : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  {sessions.length > 0 ? (
                    <div className="flex max-w-[58%] min-w-0 flex-wrap justify-end gap-1">
                      {sessions.map((session) => (
                        <Link
                          key={session.id}
                          href={`/workout?sessionId=${encodeURIComponent(session.id)}`}
                          className="max-w-full truncate rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-500/20 dark:text-red-300"
                        >
                          Session
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-6 backdrop-blur-xl">
          <h2 className="mb-4 font-medium text-text-primary">{monthLabel}</h2>
          <p className="text-text-secondary">
            {monthWorkouts.length} planned workout{monthWorkouts.length !== 1 ? "s" : ""}
            {monthWorkoutDates.size > 0 ? ` across ${monthWorkoutDates.size} day${monthWorkoutDates.size > 1 ? "s" : ""}` : ""}
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