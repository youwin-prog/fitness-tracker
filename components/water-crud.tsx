"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Droplets, PencilLine, Plus, Target, Trash2 } from "lucide-react";
import { createWaterIntake, deleteWaterIntake, quickAddWaterIntake, updateWaterGoal, updateWaterIntake } from "@/actions/water-actions";
import { waterEntrySchema, waterGoalSchema, type WaterEntryFormValues, type WaterGoalFormValues } from "@/lib/water-schema";
import type { WaterIntakeRecord } from "@/types/water";
import type { LucideIcon } from "lucide-react";

type WaterCrudProps = {
  entries: WaterIntakeRecord[];
  goalMl: number;
};

const quickAddAmounts = [250, 500, 750, 1000];

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-600 dark:text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 170;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-slate-300/50 dark:stroke-white/10"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-cyan-500 drop-shadow-[0_0_20px_rgba(103,232,249,0.35)] dark:stroke-cyan-300"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-semibold tracking-tight text-text-primary">{progress}%</p>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-text-secondary">Goal reached</p>
      </div>
    </div>
  );
}

function WaterEntryRow({
  entry,
  isSelected,
  onEdit,
  onDelete,
}: {
  entry: WaterIntakeRecord;
  isSelected: boolean;
  onEdit: (entry: WaterIntakeRecord) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`rounded-[1.5rem] border p-5 ${isSelected ? "border-cyan-400/30 bg-cyan-400/5" : "border-border bg-card"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-200/80">
              Water
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-text-secondary">{new Date(entry.takenAt).toLocaleString()}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-text-primary">{entry.amountMl} ml</h4>
            <p className="mt-1 text-sm text-text-secondary">Logged hydration intake</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-secondary/70"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function WaterCrud({ entries, goalMl }: WaterCrudProps) {
  const router = useRouter();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const entryForm = useForm<z.input<typeof waterEntrySchema>, z.input<typeof waterEntrySchema>, z.output<typeof waterEntrySchema>>({
    resolver: zodResolver(waterEntrySchema),
    defaultValues: {
      id: "",
      amountMl: 250,
      takenAt: "",
    },
  });

  const goalForm = useForm<z.input<typeof waterGoalSchema>, z.input<typeof waterGoalSchema>, z.output<typeof waterGoalSchema>>({
    resolver: zodResolver(waterGoalSchema),
    defaultValues: {
      goalMl,
    },
  });

  useEffect(() => {
    if (selectedEntry) {
      entryForm.reset({
        id: selectedEntry.id,
        amountMl: selectedEntry.amountMl,
        takenAt: new Date(selectedEntry.takenAt).toISOString().slice(0, 16),
      });
      return;
    }

    entryForm.reset({
      id: "",
      amountMl: 250,
      takenAt: "",
    });
  }, [entryForm, selectedEntry]);

  useEffect(() => {
    goalForm.reset({ goalMl });
  }, [goalForm, goalMl]);

  const todayKey = new Date().toDateString();
  const todayEntries = entries.filter((entry) => new Date(entry.takenAt).toDateString() === todayKey);
  const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.amountMl, 0);
  const remainingMl = Math.max(goalMl - todayTotal, 0);
  const progressPercent = goalMl > 0 ? Math.min(100, Math.round((todayTotal / goalMl) * 100)) : 0;
  const averageEntry = todayEntries.length ? Math.round(todayTotal / todayEntries.length) : 0;

  const recentDays = useMemo(() => {
    const totalsByDay = new Map<string, number>();

    entries.forEach((entry) => {
      const dateKey = new Date(entry.takenAt).toDateString();
      totalsByDay.set(dateKey, (totalsByDay.get(dateKey) ?? 0) + entry.amountMl);
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateKey = date.toDateString();

      return {
        label: date.toLocaleDateString([], { weekday: "short" }),
        amountMl: totalsByDay.get(dateKey) ?? 0,
      };
    });
  }, [entries]);

  const handleQuickAdd = (amountMl: number) => {
    setMessage(null);

    startTransition(async () => {
      const result = await quickAddWaterIntake(amountMl);
      setMessage(result.message ?? null);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await deleteWaterIntake(id);
      setMessage(result.message ?? null);
      setSelectedEntryId((current) => (current === id ? null : current));
      router.refresh();
    });
  };

  const handleGoalSubmit = goalForm.handleSubmit((values) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateWaterGoal(values);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0]) {
            goalForm.setError(key as keyof WaterGoalFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }

      if (!result.errors) {
        router.refresh();
      }
    });
  });

  const handleEntrySubmit = entryForm.handleSubmit((values) => {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        ...values,
        id: selectedEntry ? selectedEntry.id : undefined,
      };

      const result = selectedEntry ? await updateWaterIntake(payload) : await createWaterIntake(payload);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0] && key in payload) {
            entryForm.setError(key as keyof WaterEntryFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }

      if (!result.errors) {
        setSelectedEntryId(null);
        entryForm.reset({
          id: "",
          amountMl: 250,
          takenAt: "",
        });
        router.refresh();
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-xl shadow-slate-200/70 dark:bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] dark:shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200">
              Water intake module
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Stay hydrated with a clean daily tracker.</h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                Log water intake, adjust your daily goal, and monitor your progress in the same premium dashboard style used across the app.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Today" value={`${todayTotal} ml`} icon={Droplets} />
            <MetricCard label="Remaining" value={`${remainingMl} ml`} icon={Target} />
            <MetricCard label="Entries" value={String(todayEntries.length)} icon={Clock3} />
            <MetricCard label="Average" value={`${averageEntry} ml`} icon={CalendarDays} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 space-y-6 rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200/80">Daily target</p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">Water goal progress</h3>
            </div>
            <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-text-secondary">
              {goalMl} ml goal
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-6">
            <div className="flex min-w-0 justify-center">
              <ProgressRing progress={progressPercent} />
            </div>

            <div className="min-w-0 w-full space-y-4 rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <label className="space-y-2 text-sm text-text-secondary">
                  <span>Daily water goal (ml)</span>
                  <input
                    {...goalForm.register("goalMl")}
                    type="number"
                    min="1"
                    className="block min-w-0 w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  />
                  {goalForm.formState.errors.goalMl ? <p className="text-xs text-rose-500">{goalForm.formState.errors.goalMl.message}</p> : null}
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Save goal
                  </button>
                </div>
              </form>

              <div className="grid w-full min-w-0 grid-cols-2 gap-2">
                {quickAddAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAdd(amount)}
                    className="inline-flex min-w-0 w-full items-center justify-center whitespace-nowrap rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-2 py-3 text-sm font-medium text-cyan-700 transition hover:bg-cyan-400/20 dark:text-cyan-100 sm:px-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Quick add {amount} ml
                  </button>
                ))}
              </div>

              <div className="min-w-0 rounded-[1.25rem] border border-border bg-card px-4 py-3 text-sm leading-6 text-text-secondary">
                You&apos;ve consumed {todayTotal} ml today. {remainingMl} ml left to hit your target.
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-secondary">Recent days</p>
                <h4 className="mt-1 text-lg font-semibold text-text-primary">Seven-day intake history</h4>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
              {recentDays.map((day) => {
                const percent = goalMl > 0 ? Math.min(100, Math.round((day.amountMl / goalMl) * 100)) : 0;

                return (
                  <div key={day.label} className="space-y-3 text-center">
                    <div className="flex h-44 items-end rounded-[1.25rem] bg-card p-2">
                      <div
                        className="w-full rounded-[0.9rem] bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-400"
                        style={{ height: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{day.label}</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">{day.amountMl} ml</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200/80">History</p>
            <h3 className="mt-2 text-xl font-semibold text-text-primary">Today&apos;s water log</h3>
          </div>

          <form onSubmit={handleEntrySubmit} className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
            <input type="hidden" {...entryForm.register("id")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-text-secondary sm:col-span-2">
                <span>Amount (ml)</span>
                <input
                  {...entryForm.register("amountMl")}
                  type="number"
                  min="1"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                />
                {entryForm.formState.errors.amountMl ? <p className="text-xs text-rose-500">{entryForm.formState.errors.amountMl.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-text-secondary sm:col-span-2">
                <span>Date and time</span>
                <input
                  {...entryForm.register("takenAt")}
                  type="datetime-local"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                />
                {entryForm.formState.errors.takenAt ? <p className="text-xs text-rose-500">{entryForm.formState.errors.takenAt.message}</p> : null}
              </label>
            </div>

            {message ? <p className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-text-secondary">{message}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {selectedEntry ? "Update entry" : "Create entry"}
              </button>
              {selectedEntry ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEntryId(null);
                    entryForm.reset({ id: "", amountMl: 250, takenAt: "" });
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-text-primary transition hover:bg-secondary/70"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New entry
                </button>
              ) : null}
            </div>
          </form>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5 text-sm text-text-secondary">
                No water entries yet. Add your first hydration reminder and start building a daily routine.
              </div>
            ) : (
              entries.map((entry) => (
                <WaterEntryRow
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedEntryId === entry.id}
                  onEdit={(item) => setSelectedEntryId(item.id)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}