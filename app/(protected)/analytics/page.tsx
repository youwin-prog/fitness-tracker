import { getGoalModuleData } from "@/actions/goal-actions";
import { getMealEntries } from "@/actions/nutrition-actions";
import { getSleepModuleData } from "@/actions/sleep-actions";
import { getWaterModuleData } from "@/actions/water-actions";
import { getWeightModuleData } from "@/actions/weight-actions";
import { getWorkoutSessions } from "@/actions/workout-actions";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const DATE_KEY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

function getLocalDateKey(value: string | Date) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateLabel(value: string | Date) {
  return DAY_LABEL_FORMAT.format(new Date(value));
}

function getRecentDays(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    return {
      key: getLocalDateKey(date),
      label: date.toLocaleDateString("en-US", DATE_KEY_FORMAT_OPTIONS),
      shortLabel: getDateLabel(date),
    };
  });
}

export default async function AnalyticsPage() {
  const [workouts, meals, water, weight, sleep, goals] = await Promise.all([
    getWorkoutSessions(),
    getMealEntries(),
    getWaterModuleData(),
    getWeightModuleData(),
    getSleepModuleData(),
    getGoalModuleData(),
  ]);

  const recentDays = getRecentDays(7);
  const workoutDailyMap = Object.fromEntries(recentDays.map((day) => [day.key, { sessions: 0, minutes: 0 }]));
  const calorieDailyMap = Object.fromEntries(recentDays.map((day) => [day.key, 0]));
  const waterDailyMap = Object.fromEntries(recentDays.map((day) => [day.key, 0]));
  const sleepDailyMap = Object.fromEntries(recentDays.map((day) => [day.key, 0]));

  workouts.forEach((session) => {
    const dateKey = getLocalDateKey(session.startedAt);
    const bucket = workoutDailyMap[dateKey];

    if (bucket) {
      bucket.sessions += 1;
      bucket.minutes += Number(session.durationMinutes ?? 0);
    }
  });

  meals.forEach((meal) => {
    const dateKey = getLocalDateKey(meal.eatenAt);
    const current = calorieDailyMap[dateKey];

    if (current !== undefined) {
      calorieDailyMap[dateKey] = current + Number(meal.calories ?? 0);
    }
  });

  water.entries.forEach((entry) => {
    const dateKey = getLocalDateKey(entry.takenAt);
    const current = waterDailyMap[dateKey];

    if (current !== undefined) {
      waterDailyMap[dateKey] = current + Number(entry.amountMl ?? 0);
    }
  });

  sleep.entries.forEach((entry) => {
    const dateKey = getLocalDateKey(entry.recordedAt);
    const current = sleepDailyMap[dateKey];

    if (current !== undefined) {
      sleepDailyMap[dateKey] = current + Number(entry.sleepHours ?? 0);
    }
  });

  const weeklyWorkoutData = recentDays.map((day) => ({
    label: day.shortLabel,
    sessions: workoutDailyMap[day.key]?.sessions ?? 0,
    minutes: workoutDailyMap[day.key]?.minutes ?? 0,
  }));

  const dailyCaloriesData = recentDays.map((day) => ({
    label: day.shortLabel,
    calories: calorieDailyMap[day.key] ?? 0,
  }));

  const waterData = recentDays.map((day) => ({
    label: day.shortLabel,
    amountMl: waterDailyMap[day.key] ?? 0,
  }));

  const sleepData = recentDays.map((day) => ({
    label: day.shortLabel,
    sleepHours: sleepDailyMap[day.key] ?? 0,
  }));

  const sortedWeightEntries = [...weight.entries].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime(),
  );

  const weightData = sortedWeightEntries.slice(-12).map((entry) => ({
    label: new Date(entry.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weightKg: Number(entry.weightKg ?? 0),
  }));

  const workoutTotals = weeklyWorkoutData.reduce(
    (accumulator, entry) => ({
      sessions: accumulator.sessions + entry.sessions,
      minutes: accumulator.minutes + entry.minutes,
    }),
    { sessions: 0, minutes: 0 },
  );

  const latestWeightKg = sortedWeightEntries.at(-1)?.weightKg ?? null;
  const firstWeightKg = sortedWeightEntries[0]?.weightKg ?? null;

  const totalCalories = dailyCaloriesData.reduce((sum, entry) => sum + entry.calories, 0);
  const totalWater = waterData.reduce((sum, entry) => sum + entry.amountMl, 0);
  const totalSleep = sleepData.reduce((sum, entry) => sum + entry.sleepHours, 0);
  const completedGoals = goals.goals.filter((goal) => goal.status === "COMPLETED").length;
  const activeGoals = goals.goals.length - completedGoals;

  return (
    <AnalyticsDashboard
      weeklyWorkoutData={weeklyWorkoutData}
      weightData={weightData}
      dailyCaloriesData={dailyCaloriesData}
      waterData={waterData}
      waterGoalMl={Number(water.goalMl ?? 0)}
      sleepData={sleepData}
      goalSummary={[
        { name: "Active", value: activeGoals },
        { name: "Completed", value: completedGoals },
      ]}
      workoutTotals={workoutTotals}
      weightSummary={{
        latestWeightKg: latestWeightKg === null ? null : Number(latestWeightKg),
        changeKg:
          firstWeightKg === null || latestWeightKg === null ? null : Number(latestWeightKg) - Number(firstWeightKg),
      }}
      calorieSummary={{
        totalCalories,
        averageCalories: Math.round(totalCalories / recentDays.length),
      }}
      waterSummary={{
        totalMl: totalWater,
        goalMl: Number(water.goalMl ?? 0),
        adherencePercent: Number(water.goalMl ?? 0) > 0 ? Math.round((totalWater / (Number(water.goalMl ?? 0) * recentDays.length)) * 100) : 0,
      }}
      sleepSummary={{
        averageHours: Number((totalSleep / recentDays.length).toFixed(1)),
        totalHours: Number(totalSleep.toFixed(1)),
      }}
      goalCompletionSummary={{
        totalGoals: goals.goals.length,
        activeGoals,
        completedGoals,
        completionRate: goals.goals.length > 0 ? Math.round((completedGoals / goals.goals.length) * 100) : 0,
      }}
    />
  );
}
