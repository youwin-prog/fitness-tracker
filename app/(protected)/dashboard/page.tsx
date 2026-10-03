import { ArrowUpRight, Dumbbell, Flame, HeartPulse, Salad, TimerReset, Trophy } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Workout streak", value: "12 days", change: "+3 vs last week", icon: Flame },
  { label: "Calories burned", value: "2,480", change: "+14% this week", icon: HeartPulse },
  { label: "Active minutes", value: "5h 42m", change: "+38 min today", icon: TimerReset },
  { label: "Goals completed", value: "8/10", change: "80% completion", icon: Trophy },
];

const todayPlan = [
  { title: "Upper body strength", detail: "Dumbbell press, rows, push-ups", time: "7:00 AM", icon: Dumbbell },
  { title: "Post-workout meal", detail: "Protein, greens, and slow carbs", time: "8:15 AM", icon: Salad },
  { title: "Recovery walk", detail: "20 minute low-intensity walk", time: "6:30 PM", icon: ArrowUpRight },
];

const activity = [
  { label: "Strength", value: 82 },
  { label: "Cardio", value: 64 },
  { label: "Mobility", value: 48 },
  { label: "Sleep", value: 91 },
];

export default function DashboardPage() {
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
                Good to see you back, Alex.
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
              +18% this week
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
                {[
                  "Complete strength session before noon",
                  "Keep protein intake above target",
                  "Close the day with a recovery walk",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-border-color dark:border-white/10 bg-card dark:bg-white/5 px-4 py-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-300" />
                    <p className="text-sm leading-6 text-text-secondary dark:text-slate-200">{item}</p>
                  </div>
                ))}
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
            {todayPlan.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-start gap-4 rounded-[1.5rem] border border-border-color dark:border-white/10 bg-card dark:bg-slate-950/60 p-4">
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 dark:text-red-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-medium text-text-primary dark:text-white">{item.title}</h4>
                      <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-text-secondary dark:text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-text-secondary dark:text-slate-300">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-border-color dark:border-white/10 bg-gradient-to-br from-red-400/10 to-red-500/10 p-5">
            <p className="text-sm text-text-secondary dark:text-slate-300">Recovery score</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-text-primary dark:text-white">92</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">Ready for today&apos;s workload</p>
              </div>
              <div className="rounded-full border border-border-color dark:border-white/10 bg-card dark:bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-red-100 dark:text-red-200">
                Excellent
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}