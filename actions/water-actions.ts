"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { waterEntrySchema, waterGoalSchema, type WaterEntryFormValues, type WaterGoalFormValues } from "@/lib/water-schema";
import type { WaterModuleData } from "@/types/water";

export type WaterEntryActionState = {
  message?: string;
  errors?: Partial<Record<keyof WaterEntryFormValues, string[]>>;
};

export type WaterGoalActionState = {
  message?: string;
  errors?: Partial<Record<keyof WaterGoalFormValues, string[]>>;
};

async function getAuthenticatedUser() {
  const { userId } = auth();

  if (!userId) {
    redirect("/login");
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to load the authenticated user.");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated user is missing an email address.");
  }

  const name =
    clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName ?? clerkUser.username ?? null;

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl || null,
    },
    create: {
      clerkUserId: userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl || null,
    },
  });
}

async function getOrCreateWaterSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStartOfRecentWindow(daysBack: number) {
  const date = getStartOfToday();
  date.setDate(date.getDate() - daysBack);
  return date;
}

export async function getWaterModuleData(): Promise<WaterModuleData> {
  const user = await getAuthenticatedUser();
  const settings = await getOrCreateWaterSettings(user.id);

  const entries = await prisma.waterIntakeEntry.findMany({
    where: {
      userId: user.id,
      takenAt: {
        gte: getStartOfRecentWindow(13),
      },
    },
    orderBy: { takenAt: "desc" },
  });

  return {
    goalMl: settings.waterGoalMl,
    entries: entries.map((entry) => ({
      id: entry.id,
      amountMl: entry.amountMl,
      takenAt: entry.takenAt.toISOString(),
    })),
  };
}

export async function createWaterIntake(input: WaterEntryFormValues): Promise<WaterEntryActionState> {
  const parsed = waterEntrySchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.waterIntakeEntry.create({
    data: {
      userId: user.id,
      amountMl: values.amountMl,
      takenAt: new Date(values.takenAt),
    },
  });

  revalidatePath("/water");

  return { message: "Water intake added successfully." };
}

export async function quickAddWaterIntake(amountMl: number): Promise<WaterEntryActionState> {
  const parsed = zodQuickAddSchema.safeParse({ amountMl });

  if (!parsed.success) {
    return { message: "Please choose a valid amount." };
  }

  const user = await getAuthenticatedUser();

  await prisma.waterIntakeEntry.create({
    data: {
      userId: user.id,
      amountMl: parsed.data.amountMl,
      takenAt: new Date(),
    },
  });

  revalidatePath("/water");

  return { message: `${parsed.data.amountMl} ml added.` };
}

export async function updateWaterIntake(input: WaterEntryFormValues): Promise<WaterEntryActionState> {
  const parsed = waterEntrySchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select an entry to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const existingEntry = await prisma.waterIntakeEntry.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (!existingEntry) {
    return { message: "Water entry not found." };
  }

  const values = parsed.data;

  await prisma.waterIntakeEntry.update({
    where: { id: existingEntry.id },
    data: {
      amountMl: values.amountMl,
      takenAt: new Date(values.takenAt),
    },
  });

  revalidatePath("/water");

  return { message: "Water entry updated successfully." };
}

export async function deleteWaterIntake(id: string): Promise<WaterEntryActionState> {
  const parsed = waterEntrySchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const result = await prisma.waterIntakeEntry.deleteMany({
    where: {
      id: parsed,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return { message: "Water entry not found." };
  }

  revalidatePath("/water");

  return { message: "Water entry deleted successfully." };
}

export async function updateWaterGoal(input: WaterGoalFormValues): Promise<WaterGoalActionState> {
  const parsed = waterGoalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { waterGoalMl: parsed.data.goalMl },
    create: {
      userId: user.id,
      waterGoalMl: parsed.data.goalMl,
    },
  });

  revalidatePath("/water");

  return { message: "Daily water goal updated." };
}

const zodQuickAddSchema = waterEntrySchema.pick({ amountMl: true });