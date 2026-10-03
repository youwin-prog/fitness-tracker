import { getWorkoutSessions } from "@/actions/workout-actions";
import { CalendarClient } from "@/components/calendar-client";

export default async function CalendarPage() {
  const workouts = await getWorkoutSessions();

  return <CalendarClient workouts={workouts.map((workout) => ({ id: workout.id, startedAt: workout.startedAt.toISOString() }))} />;
}