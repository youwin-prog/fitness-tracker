export type ProfileRecord = {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  age: number | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  gender: "PREFER_NOT_TO_SAY" | "FEMALE" | "MALE" | "NON_BINARY" | null;
  activityLevel: "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE" | null;
  fitnessGoal: "LOSE_WEIGHT" | "BUILD_MUSCLE" | "MAINTAIN_HEALTH" | "IMPROVE_ENDURANCE" | null;
};

export type ProfileModuleData = {
  profile: ProfileRecord;
};