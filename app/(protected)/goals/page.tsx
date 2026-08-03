import { getGoalModuleData } from "@/actions/goal-actions";
import { GoalCrud } from "@/components/goal-crud";

export default async function GoalsPage() {
  const data = await getGoalModuleData();

  return <GoalCrud goals={data.goals} />;
}
