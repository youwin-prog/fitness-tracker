"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { BedDouble, CalendarDays, MoonStar, PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { createSleepEntry, deleteSleepEntry, updateSleepEntry } from "@/actions/sleep-actions";
import { sleepEntrySchema, type SleepEntryFormValues } from "@/lib/sleep-schema";
import type { LucideIcon } from "lucide-react";
import type { SleepEntryRecord, SleepModuleData } from "@/types/sleep";

type SleepCrudProps = SleepModuleData;

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

function ProgressPill({ quality }: { quality: number }) {
  const label = quality >= 4 ? "Excellent" : quality >= 3 ? "Good" : quality >= 2 ? "Fair" : "Low";
  return (
    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-200">{label}</span>
  );
}

function SleepHistoryRow({
  entry,
  onEdit,
  onDelete,
  isSelected,
}: {
  entry: SleepEntryRecord;
  onEdit: (entry: SleepEntryRecord) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-[1.5rem] border p-5 ${isSelected ? "border-cyan-400/30 bg-cyan-400/5" : "border-border bg-card"}`}>
      <div className="space-y-4">
        <div className="w-full min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-200/80">
              Sleep
            </span>
            <span className="break-words text-xs uppercase tracking-[0.18em] text-text-secondary">{new Date(entry.recordedAt).toLocaleString()}</span>
            <ProgressPill quality={entry.quality} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-text-primary">{entry.sleepHours.toFixed(1)} hours</h4>
            <p className="mt-1 text-sm text-text-secondary">Sleep quality {entry.quality}/5</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
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

export function SleepCrud({ entries }: SleepCrudProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const form = useForm<z.input<typeof sleepEntrySchema>, z.input<typeof sleepEntrySchema>, z.output<typeof sleepEntrySchema>>({
    resolver: zodResolver(sleepEntrySchema),
    defaultValues: {
      id: "",
      sleepHours: 8,
      quality: 4,
      recordedAt: "",
    },
  });

  useEffect(() => {
    if (selectedEntry) {
      form.reset({
        id: selectedEntry.id,
        sleepHours: selectedEntry.sleepHours,
        quality: selectedEntry.quality,
        recordedAt: new Date(selectedEntry.recordedAt).toISOString().slice(0, 16),
      });
      return;
    }

    form.reset({
      id: "",
      sleepHours: 8,
      quality: 4,
      recordedAt: "",
    });
  }, [form, selectedEntry]);

  const todayKey = new Date().toDateString();
  const todaysEntries = entries.filter((entry) => new Date(entry.recordedAt).toDateString() === todayKey);
  const totalHoursToday = todaysEntries.reduce((sum, entry) => sum + entry.sleepHours, 0);
  const averageQualityToday = todaysEntries.length
    ? (todaysEntries.reduce((sum, entry) => sum + entry.quality, 0) / todaysEntries.length).toFixed(1)
    : "0.0";
  const latestEntry = entries[0] ?? null;
  const averageSleep = entries.length ? (entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length).toFixed(1) : "0.0";

  const weeklyHistory = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((date) => {
      const dateKey = date.toDateString();
      const entry = entries.find((item) => new Date(item.recordedAt).toDateString() === dateKey);

      return {
        label: date.toLocaleDateString([], { weekday: "short" }),
        sleepHours: entry?.sleepHours ?? 0,
        quality: entry?.quality ?? 0,
      };
    });
  }, [entries]);

  const handleDelete = (id: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await deleteSleepEntry(id);
      setMessage(result.message ?? null);
      setSelectedEntryId((current) => (current === id ? null : current));
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        ...values,
        id: selectedEntry ? selectedEntry.id : undefined,
      };

      const result = selectedEntry ? await updateSleepEntry(payload) : await createSleepEntry(payload);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0] && key in payload) {
            form.setError(key as keyof SleepEntryFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }

      if (!result.errors) {
        setSelectedEntryId(null);
        form.reset({ id: "", sleepHours: 8, quality: 4, recordedAt: "" });
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-border bg-white/90 p-6 shadow-xl shadow-slate-200/70 dark:bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] dark:shadow-black/30 sm:p-8">
        <div className="grid min-w-0 max-w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div className="min-w-0 space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200">
              Sleep tracker
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Log sleep, track recovery, and spot patterns.</h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                Record daily sleep duration and quality, review today&apos;s summary, and keep an eye on your recent weekly sleep history.
              </p>
            </div>
          </div>

          <div className="grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Today" value={`${totalHoursToday.toFixed(1)} hrs`} icon={BedDouble} />
            <MetricCard label="Avg quality" value={`${averageQualityToday}/5`} icon={Star} />
            <MetricCard label="Entries" value={String(todaysEntries.length)} icon={CalendarDays} />
            <MetricCard label="Weekly avg" value={`${averageSleep} hrs`} icon={MoonStar} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div className="rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200/80">
                {selectedEntry ? "Edit sleep entry" : "Add sleep entry"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">
                {selectedEntry ? "Update sleep log" : "Log today's sleep"}
              </h3>
            </div>
            <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-text-secondary">
              {isPending ? "Saving" : selectedEntry ? "Editing" : "Creating"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input type="hidden" {...form.register("id")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-text-secondary sm:col-span-2">
                <span>Sleep duration (hours)</span>
                <input
                  {...form.register("sleepHours")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.sleepHours ? <p className="text-xs text-rose-500">{form.formState.errors.sleepHours.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-text-secondary sm:col-span-2">
                <span>Sleep quality</span>
                <select
                  {...form.register("quality")}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Fair</option>
                  <option value={3}>3 - Good</option>
                  <option value={4}>4 - Great</option>
                  <option value={5}>5 - Excellent</option>
                </select>
                {form.formState.errors.quality ? <p className="text-xs text-rose-500">{form.formState.errors.quality.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-text-secondary sm:col-span-2">
                <span>Date and time</span>
                <input
                  {...form.register("recordedAt")}
                  type="datetime-local"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.recordedAt ? <p className="text-xs text-rose-500">{form.formState.errors.recordedAt.message}</p> : null}
              </label>
            </div>

            {message ? <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-text-secondary">{message}</p> : null}

            <div className="flex flex-wrap gap-3">
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
                    form.reset({ id: "", sleepHours: 8, quality: 4, recordedAt: "" });
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-text-primary transition hover:bg-secondary/70"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New entry
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6 backdrop-blur-xl sm:p-8">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-border bg-secondary/60 p-5">
              <p className="text-sm text-text-secondary">Today&apos;s sleep summary</p>
              <h4 className="mt-2 text-lg font-semibold text-text-primary">{totalHoursToday.toFixed(1)} hours</h4>
              <p className="mt-2 text-sm text-text-secondary">Average quality {averageQualityToday}/5</p>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-secondary/60 p-5">
              <p className="text-sm text-text-secondary">Recovery insight</p>
              <h4 className="mt-2 text-lg font-semibold text-text-primary">{latestEntry ? `${latestEntry.sleepHours.toFixed(1)} hrs last night` : "No recent entry"}</h4>
              <p className="mt-2 text-sm text-text-secondary">Sleep quality influences overall readiness and training output.</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-secondary/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-secondary">Weekly history</p>
                <h4 className="mt-1 text-lg font-semibold text-text-primary">Sleep hours trend</h4>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(2,6,23,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#cbd5e1" }}
                  />
                  <Line type="monotone" dataKey="sleepHours" stroke="#67e8f9" strokeWidth={3} dot={{ r: 4, fill: "#67e8f9" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-secondary/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-secondary">Daily history</p>
                <h4 className="mt-1 text-lg font-semibold text-text-primary">Recent entries</h4>
              </div>
              <BedDouble className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
            </div>

            <div className="mt-5 space-y-3">
              {entries.length === 0 ? (
                <div className="rounded-[1.5rem] border border-border bg-card p-5 text-sm text-text-secondary">
                  No sleep entries yet. Add your first nightly log to begin tracking recovery.
                </div>
              ) : (
                entries.map((entry) => (
                  <SleepHistoryRow
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
        </div>
      </section>
    </div>
  );
}
