export type WaterIntakeRecord = {
  id: string;
  amountMl: number;
  takenAt: string;
};

export type WaterModuleData = {
  goalMl: number;
  entries: WaterIntakeRecord[];
};