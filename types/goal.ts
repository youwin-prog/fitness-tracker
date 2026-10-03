export type GoalRecord = {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  targetDate: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

export type GoalModuleData = {
  goals: GoalRecord[];
};
