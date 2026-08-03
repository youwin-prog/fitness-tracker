export type SleepEntryRecord = {
  id: string;
  sleepHours: number;
  quality: number;
  recordedAt: string;
};

export type SleepModuleData = {
  entries: SleepEntryRecord[];
};
