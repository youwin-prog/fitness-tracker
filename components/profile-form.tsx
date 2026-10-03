"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/actions/profile-actions";
import { profileFormSchema, type ProfileFormValues } from "@/lib/profile-schema";
import type { ProfileRecord } from "@/types/profile";

type ProfileFormProps = {
  profile: ProfileRecord;
};

const defaultFormValues: ProfileFormValues = {
  id: "",
  fullName: "",
  profileImageUrl: "",
  age: undefined,
  heightCm: undefined,
  currentWeightKg: undefined,
  gender: "PREFER_NOT_TO_SAY",
  activityLevel: "MODERATE",
  fitnessGoal: "MAINTAIN_HEALTH",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-text-secondary">{children}</span>;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.input<typeof profileFormSchema>, z.input<typeof profileFormSchema>, z.output<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    form.reset({
      id: profile.id,
      fullName: profile.fullName,
      profileImageUrl: profile.profileImageUrl ?? "",
      age: profile.age ?? undefined,
      heightCm: profile.heightCm ?? undefined,
      currentWeightKg: profile.currentWeightKg ?? undefined,
      gender: profile.gender ?? "PREFER_NOT_TO_SAY",
      activityLevel: profile.activityLevel ?? "MODERATE",
      fitnessGoal: profile.fitnessGoal ?? "MAINTAIN_HEALTH",
    });
  }, [form, profile]);

  const previewName = profile.fullName || "Your profile";
  const previewImage = (form.watch("profileImageUrl") || profile.profileImageUrl) as string | undefined;

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfile(values);

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (messages?.[0]) {
            form.setError(key as keyof ProfileFormValues, { message: messages[0] });
          }
        });
      }

      if (result.message) {
        setMessage(result.message);
      }
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2.25rem] border border-border bg-white/80 p-6 shadow-xl shadow-slate-200/70 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_35%),linear-gradient(135deg,rgba(8,15,32,0.96),rgba(15,23,42,0.72))] dark:shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-200">
              Profile
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Manage your personal profile</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                Keep your account details current so the dashboard can reflect your body metrics, training preferences, and fitness target.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-card p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border bg-secondary/80">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt={previewName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cyan-600 dark:text-cyan-200">
                    <UserRound className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Profile preview</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">{previewName}</p>
                <p className="text-sm text-text-secondary">{profile.gender ?? "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Update the information that powers your personal fitness dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <input type="hidden" {...form.register("id")} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Profile picture URL</FieldLabel>
                  <div className="relative">
                    <Camera className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      {...form.register("profileImageUrl")}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-text-primary outline-none transition placeholder:text-text-muted focus:border-cyan-400/40"
                    />
                  </div>
                  {form.formState.errors.profileImageUrl ? <p className="text-xs text-rose-500">{form.formState.errors.profileImageUrl.message}</p> : null}
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Full name</FieldLabel>
                  <input
                    {...form.register("fullName")}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-cyan-400/40"
                  />
                  {form.formState.errors.fullName ? <p className="text-xs text-rose-500">{form.formState.errors.fullName.message}</p> : null}
                </label>

                <label className="space-y-2">
                  <FieldLabel>Age</FieldLabel>
                  <input
                    {...form.register("age")}
                    type="number"
                    min="1"
                    max="120"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  />
                  {form.formState.errors.age ? <p className="text-xs text-rose-500">{form.formState.errors.age.message}</p> : null}
                </label>

                <label className="space-y-2">
                  <FieldLabel>Height (cm)</FieldLabel>
                  <input
                    {...form.register("heightCm")}
                    type="number"
                    min="1"
                    max="300"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  />
                  {form.formState.errors.heightCm ? <p className="text-xs text-rose-500">{form.formState.errors.heightCm.message}</p> : null}
                </label>

                <label className="space-y-2">
                  <FieldLabel>Current weight (kg)</FieldLabel>
                  <input
                    {...form.register("currentWeightKg")}
                    type="number"
                    step="0.1"
                    min="1"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  />
                  {form.formState.errors.currentWeightKg ? <p className="text-xs text-rose-500">{form.formState.errors.currentWeightKg.message}</p> : null}
                </label>

                <label className="space-y-2">
                  <FieldLabel>Gender</FieldLabel>
                  <select
                    {...form.register("gender")}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-binary</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <FieldLabel>Activity level</FieldLabel>
                  <select
                    {...form.register("activityLevel")}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="ACTIVE">Active</option>
                    <option value="VERY_ACTIVE">Very active</option>
                  </select>
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Fitness goal</FieldLabel>
                  <select
                    {...form.register("fitnessGoal")}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-text-primary outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="LOSE_WEIGHT">Lose weight</option>
                    <option value="BUILD_MUSCLE">Build muscle</option>
                    <option value="MAINTAIN_HEALTH">Maintain health</option>
                    <option value="IMPROVE_ENDURANCE">Improve endurance</option>
                  </select>
                </label>
              </div>

              {message ? <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-text-secondary">{message}</p> : null}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Saving changes" : "Save profile"}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile summary</CardTitle>
            <CardDescription>Quick snapshot of the data used across your fitness experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Name" value={profile.fullName || "Not set"} />
              <SummaryItem label="Age" value={profile.age ? `${profile.age}` : "Not set"} />
              <SummaryItem label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : "Not set"} />
              <SummaryItem label="Weight" value={profile.currentWeightKg ? `${profile.currentWeightKg.toFixed(1)} kg` : "Not set"} />
              <SummaryItem label="Gender" value={formatProfileValue(profile.gender)} />
              <SummaryItem label="Activity" value={formatProfileValue(profile.activityLevel)} />
              <SummaryItem label="Goal" value={formatProfileValue(profile.fitnessGoal)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function formatProfileValue(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}