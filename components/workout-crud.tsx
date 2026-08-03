"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Clock3, Dumbbell, Flame, HeartPulse, PencilLine, Trash2 } from "lucide-react";
import type { WorkoutSession } from "@prisma/client";
import { createWorkout, deleteWorkout, updateWorkout, type WorkoutFormState } from "@/actions/workout-actions";

type WorkoutCrudProps = {
  workouts: WorkoutSession[];
};

const initialState: WorkoutFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function WorkoutCrud({ workouts }: WorkoutCrudProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(workouts[0]?.id ?? null);
  const selectedWorkout = useMemo(() => workouts.find((workout) => workout.id === selectedWorkoutId) ?? null, [selectedWorkoutId, workouts]);

  useEffect(() => {
    if (!selectedWorkout && workouts.length > 0) {
      setSelectedWorkoutId(workouts[0].id);
    }
  }, [selectedWorkout, workouts]);

  const [createState, createAction] = useFormState(createWorkout, initialState);
  const [updateState, updateAction] = useFormState(updateWorkout, initialState);
  const currentState = selectedWorkout ? updateState : createState;

  const startedAtValue = selectedWorkout ? new Date(selectedWorkout.startedAt).toISOString().slice(0, 16) : "";
  const endedAtValue = selectedWorkout?.endedAt ? new Date(selectedWorkout.endedAt).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Recorded sessions", value: String(workouts.length), icon: Dumbbell },
          { label: "Total volume", value: `${workouts.reduce((sum, workout) => sum + (workout.durationMinutes ?? 0), 0)} min`, icon: Clock3 },
          { label: "Calories tracked", value: `${workouts.reduce((sum, workout) => sum + (workout.caloriesBurned ?? 0), 0)} kcal`, icon: Flame },
          { label: "Avg. heart rate", value: workouts.length ? `${Math.round(workouts.reduce((sum, workout) => sum + (workout.heartRateAverage ?? 0), 0) / workouts.length)} bpm` : "0 bpm", icon: HeartPulse },
        ].map((stat) => {
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                {selectedWorkout ? "Edit workout" : "New workout"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedWorkout ? "Update your session" : "Log a workout session"}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {selectedWorkout ? "Editing" : "Creating"}
            </div>
          </div>

          <form action={selectedWorkout ? updateAction : createAction} className="mt-6 space-y-4">
            <input type="hidden" name="id" defaultValue={selectedWorkout?.id ?? ""} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Workout title</span>
                <input
                  name="title"
                  defaultValue={selectedWorkout?.title ?? ""}
                  placeholder="Upper body strength"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Workout type</span>
                <select
                  name="type"
                  defaultValue={selectedWorkout?.type ?? "STRENGTH"}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                >
                  <option value="STRENGTH">Strength</option>
                  <option value="CARDIO">Cardio</option>
                  <option value="MOBILITY">Mobility</option>
                  <option value="RECOVERY">Recovery</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Started at</span>
                <input
                  name="startedAt"
                  type="datetime-local"
                  defaultValue={startedAtValue}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Ended at</span>
                <input
                  name="endedAt"
                  type="datetime-local"
                  defaultValue={endedAtValue}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Duration (minutes)</span>
                <input
                  name="durationMinutes"
                  type="number"
                  min="1"
                  defaultValue={selectedWorkout?.durationMinutes ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Calories burned</span>
                <input
                  name="caloriesBurned"
                  type="number"
                  min="0"
                  defaultValue={selectedWorkout?.caloriesBurned ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Average heart rate</span>
                <input
                  name="heartRateAverage"
                  type="number"
                  min="0"
                  defaultValue={selectedWorkout?.heartRateAverage ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span>Notes</span>
                <textarea
                  name="notes"
                  defaultValue={selectedWorkout?.notes ?? ""}
                  rows={4}
                  placeholder="How did the workout feel?"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </label>
            </div>

            {currentState.message ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{currentState.message}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <SubmitButton label={selectedWorkout ? "Update workout" : "Create workout"} />
              {selectedWorkout ? (
                <button
                  type="button"
                  onClick={() => setSelectedWorkoutId(null)}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  New entry
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Workout log</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent sessions</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {workouts.length} total
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {workouts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                No workout sessions yet. Create the first one to begin tracking progress.
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">{workout.type}</p>
                        <h4 className="mt-1 text-lg font-semibold text-white">{workout.title}</h4>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                        <p>Started: {new Date(workout.startedAt).toLocaleString()}</p>
                        <p>Duration: {workout.durationMinutes ?? 0} min</p>
                        <p>Calories: {workout.caloriesBurned ?? 0} kcal</p>
                        <p>Heart rate: {workout.heartRateAverage ?? 0} bpm</p>
                      </div>
                      {workout.notes ? <p className="text-sm leading-7 text-slate-400">{workout.notes}</p> : null}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWorkoutId(workout.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                      <form action={deleteWorkout}>
                        <input type="hidden" name="id" value={workout.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
