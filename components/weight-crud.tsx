"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ArrowDownRight, ArrowUpRight, BadgeWeight, CalendarDays, PencilLine, Plus, Target, Trash2 } from "lucide-react";
import { createWeightEntry, deleteWeightEntry, updateWeightEntry } from "@/actions/weight-actions";
import { weightEntrySchema, type WeightEntryFormValues } from "@/lib/weight-schema";
import type { WeightEntryRecord, WeightModuleData } from "@/types/weight";
import type { LucideIcon } from "lucide-react";

type WeightCrudProps = WeightModuleData;

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
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

function ChartPanel({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Array<{ label: string; weightKg: number }>;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">{subtitle}</p>
          <h4 className="mt-2 text-lg font-semibold text-white">{title}</h4>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
              labelStyle={{ color: "#cbd5e1" }}
            />
            <Line type="monotone" dataKey="weightKg" stroke="#67e8f9" strokeWidth={3} dot={{ r: 4, fill: "#67e8f9" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WeightRow({
  entry,
  onEdit,
  onDelete,
  isSelected,
}: {
  entry: WeightEntryRecord;
  onEdit: (entry: WeightEntryRecord) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}) {
  return (
    <div className={`rounded-[1.5rem] border p-5 ${isSelected ? "border-cyan-400/30 bg-cyan-400/5" : "border-white/10 bg-slate-950/60"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/80">
              Weight
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{new Date(entry.recordedAt).toLocaleString()}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">{entry.weightKg.toFixed(1)} kg</h4>
            <p className="mt-1 text-sm text-slate-300">Logged body weight</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
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

function calculateBmi(weightKg: number, heightCm: number | null) {
  if (!heightCm || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function getWeekStart(date: Date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1);
  clone.setDate(diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function getMonthStart(date: Date) {
  const clone = new Date(date);
  clone.setDate(1);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

export function WeightCrud({ entries, heightCm }: WeightCrudProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const form = useForm<WeightEntryFormValues>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      id: "",
      weightKg: 0,
      recordedAt: "",
    },
  });

  useEffect(() => {
    if (selectedEntry) {
      form.reset({
        id: selectedEntry.id,
        weightKg: selectedEntry.weightKg,
        recordedAt: new Date(selectedEntry.recordedAt).toISOString().slice(0, 16),
      });
      return;
    }

    form.reset({
      id: "",
      weightKg: 0,
      recordedAt: "",
    });
  }, [form, selectedEntry]);

  const todayKey = new Date().toDateString();
  const todaysEntries = entries.filter((entry) => new Date(entry.recordedAt).toDateString() === todayKey);
  const latestEntry = entries[0] ?? null;
  const previousEntry = entries[1] ?? null;
  const bmi = latestEntry ? calculateBmi(latestEntry.weightKg, heightCm) : null;
  const weeklyChange = latestEntry && previousEntry ? latestEntry.weightKg - previousEntry.weightKg : null;

  const weeklyData = useMemo(() => {
    const start = getWeekStart(new Date());
    const map = new Map<string, number>();

    entries.forEach((entry) => {
      const date = new Date(entry.recordedAt);
      if (date >= start) {
        map.set(date.toDateString(), entry.weightKg);
      }
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const entryWeight = map.get(date.toDateString()) ?? null;

      return {
        label: date.toLocaleDateString([], { weekday: "short" }),
        weightKg: entryWeight ?? (index > 0 ? 0 : latestEntry?.weightKg ?? 0),
      };
    }).filter((item) => item.weightKg > 0);
  }, [entries, latestEntry]);

  const monthlyData = useMemo(() => {
    const start = getMonthStart(new Date());
    const map = new Map<string, number>();

    entries.forEach((entry) => {
      const date = new Date(entry.recordedAt);
      if (date >= start) {
        map.set(date.toDateString(), entry.weightKg);
      }
    });

    return Array.from({ length: new Date().getDate() }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const entryWeight = map.get(date.toDateString()) ?? null;

      return {
        label: String(date.getDate()),
        weightKg: entryWeight ?? 0,
      };
    }).filter((item) => item.weightKg > 0);
  }, [entries]);

  const handleDelete = (id: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await deleteWeightEntry(id);
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

      const result = selectedEntry ? await updateWeightEntry(payload) : await createWeightEntry(payload);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0] && key in payload) {
            form.setError(key as keyof WeightEntryFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }

      if (!result.errors) {
        setSelectedEntryId(null);
        form.reset({ id: "", weightKg: 0, recordedAt: "" });
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Weight tracker
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Track daily weight and trends with clarity.</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Log your weight each day, review weekly and monthly trends, and calculate BMI from your saved height.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Latest weight" value={latestEntry ? `${latestEntry.weightKg.toFixed(1)} kg` : "--"} icon={BadgeWeight} />
            <MetricCard label="BMI" value={bmi ? bmi.toFixed(1) : "--"} icon={Target} />
            <MetricCard label="Today" value={todaysEntries.length ? `${todaysEntries.length} entries` : "No entries"} icon={CalendarDays} />
            <MetricCard
              label="Weekly change"
              value={weeklyChange !== null ? `${weeklyChange > 0 ? "+" : ""}${weeklyChange.toFixed(1)} kg` : "--"}
              icon={weeklyChange !== null && weeklyChange < 0 ? ArrowDownRight : ArrowUpRight}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                {selectedEntry ? "Edit weight entry" : "Add weight entry"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedEntry ? "Update your logged weight" : "Log today&apos;s body weight"}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {isPending ? "Saving" : selectedEntry ? "Editing" : "Creating"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input type="hidden" {...form.register("id")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Weight (kg)</span>
                <input
                  {...form.register("weightKg")}
                  type="number"
                  min="1"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.weightKg ? <p className="text-xs text-rose-300">{form.formState.errors.weightKg.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Date and time</span>
                <input
                  {...form.register("recordedAt")}
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.recordedAt ? <p className="text-xs text-rose-300">{form.formState.errors.recordedAt.message}</p> : null}
              </label>
            </div>

            {message ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{message}</p> : null}

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
                    form.reset({ id: "", weightKg: 0, recordedAt: "" });
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

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <ChartPanel title="Weekly line chart" subtitle="Weekly trend" data={weeklyData} />
            <ChartPanel title="Monthly line chart" subtitle="Monthly trend" data={monthlyData} />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Daily history</p>
                <h4 className="mt-1 text-lg font-semibold text-white">Recent entries</h4>
              </div>
              <BadgeWeight className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 space-y-3">
              {entries.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  No weight entries yet. Log your first daily weight to start tracking progress.
                </div>
              ) : (
                entries.map((entry) => (
                  <WeightRow
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
