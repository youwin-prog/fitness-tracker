"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, BadgeCheck, CalendarDays, PencilLine, Plus, Target, Trash2 } from "lucide-react";
import { completeGoal, createGoal, deleteGoal, updateGoal } from "@/actions/goal-actions";
import { goalFormSchema, type GoalFormValues } from "@/lib/goal-schema";
import type { GoalRecord, GoalModuleData } from "@/types/goal";
import type { LucideIcon } from "lucide-react";

type GoalCrudProps = GoalModuleData;

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

function GoalRow({
  goal,
  onEdit,
  onDelete,
  onComplete,
  isSelected,
}: {
  goal: GoalRecord;
  onEdit: (goal: GoalRecord) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  isSelected: boolean;
}) {
  const progressPercent = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;

  return (
    <div className={`rounded-[1.5rem] border p-5 ${isSelected ? "border-cyan-400/30 bg-cyan-400/5" : "border-white/10 bg-slate-950/60"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/80">
              {goal.status}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {goal.targetDate ? `Due ${new Date(goal.targetDate).toLocaleDateString()}` : "No deadline"}
            </span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
            {goal.description ? <p className="mt-1 text-sm text-slate-300">{goal.description}</p> : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">
                Progress {goal.currentValue} / {goal.targetValue}
              </span>
              <span className="font-medium text-white">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {goal.status !== "COMPLETED" ? (
            <button
              type="button"
              onClick={() => onComplete(goal.id)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20"
            >
              <BadgeCheck className="h-4 w-4" />
              Complete
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
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

export function GoalCrud({ goals }: GoalCrudProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId) ?? null, [goals, selectedGoalId]);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      targetValue: 1,
      currentValue: 0,
      targetDate: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (selectedGoal) {
      form.reset({
        id: selectedGoal.id,
        title: selectedGoal.title,
        description: selectedGoal.description ?? "",
        targetValue: selectedGoal.targetValue,
        currentValue: selectedGoal.currentValue,
        targetDate: selectedGoal.targetDate ? new Date(selectedGoal.targetDate).toISOString().slice(0, 16) : "",
        status: selectedGoal.status,
      });
      return;
    }

    form.reset({
      id: "",
      title: "",
      description: "",
      targetValue: 1,
      currentValue: 0,
      targetDate: "",
      status: "ACTIVE",
    });
  }, [form, selectedGoal]);

  const activeGoals = goals.filter((goal) => goal.status === "ACTIVE").length;
  const completedGoals = goals.filter((goal) => goal.status === "COMPLETED").length;
  const averageProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0), 0) / goals.length)
    : 0;
  const dueSoon = goals.filter((goal) => goal.targetDate && new Date(goal.targetDate) >= new Date()).length;

  const handleEdit = (goal: GoalRecord) => {
    setMessage(null);
    setSelectedGoalId(goal.id);
  };

  const handleDelete = (id: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await deleteGoal(id);
      setMessage(result.message ?? null);
      setSelectedGoalId((current) => (current === id ? null : current));
    });
  };

  const handleComplete = (id: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await completeGoal(id);
      setMessage(result.message ?? null);
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        ...values,
        id: selectedGoal ? selectedGoal.id : undefined,
      };

      const result = selectedGoal ? await updateGoal(payload) : await createGoal(payload);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0] && key in payload) {
            form.setError(key as keyof GoalFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }

      if (!result.errors) {
        setSelectedGoalId(null);
        form.reset({
          id: "",
          title: "",
          description: "",
          targetValue: 1,
          currentValue: 0,
          targetDate: "",
          status: "ACTIVE",
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Goals module
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Set goals, track progress, and stay accountable.</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Create goals, update progress, complete milestones, and review everything from one premium dashboard view.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Active" value={String(activeGoals)} icon={Target} />
            <MetricCard label="Completed" value={String(completedGoals)} icon={BadgeCheck} />
            <MetricCard label="Due soon" value={String(dueSoon)} icon={CalendarDays} />
            <MetricCard label="Avg progress" value={`${averageProgress}%`} icon={ArrowUpRight} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                {selectedGoal ? "Edit goal" : "Add goal"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{selectedGoal ? "Update goal details" : "Create a new goal"}</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {isPending ? "Saving" : selectedGoal ? "Editing" : "Creating"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input type="hidden" {...form.register("id")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Title</span>
                <input
                  {...form.register("title")}
                  placeholder="Run 50 km this month"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
                {form.formState.errors.title ? <p className="text-xs text-rose-300">{form.formState.errors.title.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Description</span>
                <textarea
                  {...form.register("description")}
                  rows={4}
                  placeholder="Optional context for this goal"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
                {form.formState.errors.description ? <p className="text-xs text-rose-300">{form.formState.errors.description.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Target value</span>
                <input
                  {...form.register("targetValue")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.targetValue ? <p className="text-xs text-rose-300">{form.formState.errors.targetValue.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Current progress</span>
                <input
                  {...form.register("currentValue")}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
                {form.formState.errors.currentValue ? <p className="text-xs text-rose-300">{form.formState.errors.currentValue.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Deadline</span>
                <input
                  {...form.register("targetDate")}
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Status</span>
                <select
                  {...form.register("status")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
            </div>

            {message ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{message}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {selectedGoal ? "Update goal" : "Create goal"}
              </button>
              {selectedGoal ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGoalId(null);
                    form.reset({
                      id: "",
                      title: "",
                      description: "",
                      targetValue: 1,
                      currentValue: 0,
                      targetDate: "",
                      status: "ACTIVE",
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New goal
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Goal history</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent goals</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {goals.length} total
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {goals.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                No goals created yet. Add your first goal to start tracking progress.
              </div>
            ) : (
              goals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  isSelected={selectedGoalId === goal.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
