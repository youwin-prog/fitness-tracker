export type GoalRecord = {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  targetDate: string | null;
  status: "ACTIVE" | "COMPLETED";
};

export type GoalModuleData = {
  goals: GoalRecord[];
};
