"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, CalendarDays, Dumbbell, Flame, Settings2, ShieldCheck, TrendingUp } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Workouts", href: "/dashboard", icon: Dumbbell },
  { label: "Progress", href: "/dashboard", icon: TrendingUp },
  { label: "Calendar", href: "/dashboard", icon: CalendarDays },
  { label: "Goals", href: "/dashboard", icon: Flame },
  { label: "Settings", href: "/dashboard", icon: Settings2 },
];

const metrics = [
  { label: "Protected account", value: "Clerk", icon: ShieldCheck },
  { label: "Weekly sessions", value: "0", icon: Dumbbell },
  { label: "Consistency", value: "0%", icon: TrendingUp },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_26%),linear-gradient(180deg,#020617_0%,#01040b_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl xl:flex">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">Fitness Tracker</p>
            <h2 className="text-xl font-semibold tracking-tight">Control Center</h2>
          </div>

          <div className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white",
                    item.label === "Overview" && "border-cyan-400/20 bg-cyan-400/10 text-white",
                  )}
                >
                  <Icon className="h-4 w-4 text-cyan-300" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">Today</p>
            <div className="mt-4 space-y-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{metric.value}</p>
                    </div>
                    <Icon className="h-4 w-4 text-cyan-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Protected area</p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">Welcome back</p>
                <p className="text-xs text-slate-400">Your private fitness workspace</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 p-1.5">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonPopoverCard: "border border-white/10 bg-slate-950 text-white shadow-2xl",
                      userButtonPopoverActionButton: "text-slate-200 hover:bg-white/5 hover:text-white",
                      userButtonPopoverActionButtonText: "text-slate-200",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
              {children}
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl sm:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/80">Status</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Build the next layer</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This shell is ready for the metrics grid, workout charts, recent activity, and goal tracking.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Workout analytics",
                  "Nutrition insights",
                  "Weekly goal progress",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </motion.aside>
          </section>
        </div>
      </div>
    </main>
  );
}
