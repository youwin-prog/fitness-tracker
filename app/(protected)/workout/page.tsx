import { getWorkoutSessions } from "@/actions/workout-actions";
import { WorkoutCrud } from "@/components/workout-crud";

type WorkoutPageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function WorkoutPage({ searchParams }: WorkoutPageProps) {
  const workouts = await getWorkoutSessions();
  const { sessionId } = await searchParams;

  return <WorkoutCrud workouts={workouts} initialWorkoutId={sessionId} />;
}
