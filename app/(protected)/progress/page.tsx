import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Flame,
  HeartPulse,
  Medal,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const progressStats = [
  { label: "Current streak", value: "18 days", change: "+5 from last month", icon: Flame },
  { label: "Weight trend", value: "-3.4 kg", change: "Steady drop", icon: TrendingUp },
  { label: "Recovery score", value: "91", change: "Excellent readiness", icon: HeartPulse },
  { label: "Milestones hit", value: "14", change: "+2 this week", icon: Medal },
];

const weeklyTrend = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 74 },
  { day: "Wed", value: 68 },
  { day: "Thu", value: 81 },
  { day: "Fri", value: 76 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 93 },
];

const milestones = [
  {
    title: "5K run under 25 minutes",
    status: "Complete",
    detail: "You shaved 42 seconds off your previous best.",
  },
  {
    title: "Four strength sessions per week",
    status: "In progress",
    detail: "Three of four sessions are completed for this week.",
  },
  {
    title: "Consistent protein intake",
    status: "Complete",
    detail: "You hit target protein for 12 of the last 14 days.",
  },
];

const habits = [
  { label: "Training consistency", value: 94 },
  { label: "Nutrition adherence", value: 87 },
  { label: "Sleep quality", value: 91 },
  { label: "Hydration", value: 82 },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Progress overview
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Steady momentum, measured week by week.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Track training consistency, body composition trends, and daily habits in one place so you can see what is actually moving the needle.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Back to dashboard
            </Link>
            <Link
              href="/workout"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Start workout
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {progressStats.map((stat) => {
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
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.change}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Weekly trend</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Performance trajectory</h3>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Trending up
            </span>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-end gap-3 overflow-x-auto pb-2">
              {weeklyTrend.map((item) => (
                <div key={item.day} className="flex min-w-[3.5rem] flex-1 flex-col items-center gap-3">
                  <div className="flex h-56 w-full items-end justify-center rounded-[1.25rem] bg-white/5 p-2">
                    <div
                      className="w-full rounded-[1rem] bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-400 shadow-lg shadow-cyan-500/20"
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.day}</p>
                    <p className="mt-1 text-sm font-medium text-white">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-cyan-300" />
                <h4 className="font-medium text-white">Habit performance</h4>
              </div>

              <div className="mt-5 space-y-4">
                {habits.map((habit) => (
                  <div key={habit.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{habit.label}</span>
                      <span className="font-medium text-white">{habit.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
                        style={{ width: `${habit.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                <h4 className="font-medium text-white">Recent wins</h4>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Completed 7 sessions this week",
                  "Stayed under calorie target on 5 days",
                  "Improved sleep consistency for 10 straight days",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Milestones</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Goals in motion</h3>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-medium text-white">{milestone.title}</h4>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                    {milestone.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{milestone.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-5">
            <p className="text-sm text-slate-300">Next checkpoint</p>
            <h4 className="mt-1 text-lg font-semibold text-white">Assess body weight and progress photos on Friday</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Consistent measurement gives you a clearer signal than day-to-day noise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}