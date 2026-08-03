export type WeightEntryRecord = {
  id: string;
  weightKg: number;
  recordedAt: string;
};

export type WeightModuleData = {
  heightCm: number | null;
  entries: WeightEntryRecord[];
};
