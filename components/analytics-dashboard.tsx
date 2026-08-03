"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

type WorkoutChartPoint = {
  label: string;
  sessions: number;
  minutes: number;
};

type WeightChartPoint = {
  label: string;
  weightKg: number;
};

type CaloriesChartPoint = {
  label: string;
  calories: number;
};

type WaterChartPoint = {
  label: string;
  amountMl: number;
};

type SleepChartPoint = {
  label: string;
  sleepHours: number;
};

type GoalSummaryPoint = {
  name: string;
  value: number;
};

type AnalyticsDashboardProps = {
  weeklyWorkoutData: WorkoutChartPoint[];
  weightData: WeightChartPoint[];
  dailyCaloriesData: CaloriesChartPoint[];
  waterData: WaterChartPoint[];
  waterGoalMl: number;
  sleepData: SleepChartPoint[];
  goalSummary: GoalSummaryPoint[];
  workoutTotals: {
    sessions: number;
    minutes: number;
  };
  weightSummary: {
    latestWeightKg: number | null;
    changeKg: number | null;
  };
  calorieSummary: {
    totalCalories: number;
    averageCalories: number;
  };
  waterSummary: {
    totalMl: number;
    goalMl: number;
    adherencePercent: number;
  };
  sleepSummary: {
    averageHours: number;
    totalHours: number;
  };
  goalCompletionSummary: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
  };
};

const PIE_COLORS = ["#22d3ee", "#38bdf8"];

function AnalyticsCard({
  title,
  eyebrow,
  value,
  detail,
  children,
}: {
  title: string;
  eyebrow: string;
  value: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {value}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ChartShell({ children }: { children: ReactNode }) {
  return <div className="h-[260px] w-full">{children}</div>;
}

export function AnalyticsDashboard({
  weeklyWorkoutData,
  weightData,
  dailyCaloriesData,
  waterData,
  waterGoalMl,
  sleepData,
  goalSummary,
  workoutTotals,
  weightSummary,
  calorieSummary,
  waterSummary,
  sleepSummary,
  goalCompletionSummary,
}: AnalyticsDashboardProps) {
  const latestWeightLabel = weightSummary.latestWeightKg === null ? "No entries" : `${weightSummary.latestWeightKg.toFixed(1)} kg`;
  const weightChangeLabel =
    weightSummary.changeKg === null
      ? "No trend yet"
      : `${weightSummary.changeKg >= 0 ? "+" : ""}${weightSummary.changeKg.toFixed(1)} kg`;

  return (
    <div className="space-y-6">
      <section className="rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(8,15,32,0.96),rgba(15,23,42,0.74))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
              Analytics
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Performance at a glance</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Review training load, bodyweight trends, nutrition, hydration, recovery, and goal progress in one responsive dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatPill label="Workouts" value={`${workoutTotals.sessions}`} />
            <StatPill label="Workout minutes" value={`${workoutTotals.minutes} min`} />
            <StatPill label="Goal completion" value={`${goalCompletionSummary.completionRate}%`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsCard
          eyebrow="Weekly Workout Activity"
          title="Workouts and active minutes"
          value={`${workoutTotals.minutes} min`}
          detail="Monitor how your weekly training volume changes across the last seven days."
        >
          <SectionHeader
            title="Weekly activity"
            subtitle="Total workout sessions and minutes by day."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Sessions" value={`${workoutTotals.sessions}`} />
            <StatPill label="Minutes" value={`${workoutTotals.minutes} min`} />
          </div>
          <div className="mt-5">
            <ChartShell>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyWorkoutData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(34,211,238,0.08)" }}
                    contentStyle={{
                      background: "rgba(8,15,32,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="minutes" radius={[12, 12, 0, 0]} fill="url(#workoutGradient)" />
                  <defs>
                    <linearGradient id="workoutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          eyebrow="Weight Progress"
          title="Bodyweight trend"
          value={latestWeightLabel}
          detail="Track how your bodyweight changes over time using your latest progress entries."
        >
          <SectionHeader
            title="Weight trend"
            subtitle={`Latest change ${weightChangeLabel}.`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Latest" value={latestWeightLabel} />
            <StatPill label="Trend" value={weightChangeLabel} />
          </div>
          <div className="mt-5">
            <ChartShell>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,15,32,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="weightKg" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: "#22d3ee" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          eyebrow="Daily Calories"
          title="Nutrition output"
          value={`${calorieSummary.totalCalories}`}
          detail="Review daily calorie intake and keep nutrition aligned with your current target."
        >
          <SectionHeader
            title="Daily calories"
            subtitle={`Average ${calorieSummary.averageCalories} calories per day.`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Total" value={`${calorieSummary.totalCalories}`} />
            <StatPill label="Average" value={`${calorieSummary.averageCalories}`} />
          </div>
          <div className="mt-5">
            <ChartShell>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCaloriesData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,15,32,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#38bdf8" strokeWidth={3} fill="url(#calorieGradient)" />
                  <defs>
                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.48} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          eyebrow="Water Intake"
          title="Hydration tracking"
          value={`${waterSummary.adherencePercent}%`}
          detail="Compare daily water intake against your current hydration goal."
        >
          <SectionHeader
            title="Water intake"
            subtitle={`Goal ${waterGoalMl} ml per day.`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label="Total" value={`${waterSummary.totalMl} ml`} />
            <StatPill label="Goal" value={`${waterSummary.goalMl} ml`} />
            <StatPill label="Adherence" value={`${waterSummary.adherencePercent}%`} />
          </div>
          <div className="mt-5">
            <ChartShell>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,15,32,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="amountMl" name="Water intake" radius={[10, 10, 0, 0]} fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          eyebrow="Sleep Duration"
          title="Recovery and rest"
          value={`${sleepSummary.averageHours.toFixed(1)}h`}
          detail="Keep an eye on sleep duration so recovery stays consistent across the week."
        >
          <SectionHeader
            title="Sleep duration"
            subtitle={`Total ${sleepSummary.totalHours.toFixed(1)} hours logged.`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Average" value={`${sleepSummary.averageHours.toFixed(1)}h`} />
            <StatPill label="Total" value={`${sleepSummary.totalHours.toFixed(1)}h`} />
          </div>
          <div className="mt-5">
            <ChartShell>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,15,32,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="sleepHours" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: "#c4b5fd" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          eyebrow="Goal Completion Summary"
          title="Goal progress"
          value={`${goalCompletionSummary.completedGoals}/${goalCompletionSummary.totalGoals}`}
          detail="See how many goals are active, completed, and how close you are to finishing the list."
        >
          <SectionHeader
            title="Goal completion"
            subtitle={`Completion rate ${goalCompletionSummary.completionRate}%.`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label="Active" value={`${goalCompletionSummary.activeGoals}`} />
            <StatPill label="Completed" value={`${goalCompletionSummary.completedGoals}`} />
            <StatPill label="Rate" value={`${goalCompletionSummary.completionRate}%`} />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(8,15,32,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 16,
                        color: "#fff",
                      }}
                    />
                    <Pie data={goalSummary} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={4}>
                      {goalSummary.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-3">
              {goalSummary.map((entry, index) => (
                <div key={entry.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-sm font-medium text-white">{entry.name}</span>
                    </div>
                    <span className="text-sm text-slate-300">{entry.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}
