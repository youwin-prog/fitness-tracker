import { getWorkoutSessions } from "@/actions/workout-actions";
import { WorkoutCrud } from "@/components/workout-crud";

export default async function WorkoutPage() {
  const workouts = await getWorkoutSessions();

  return <WorkoutCrud workouts={workouts} />;
}
