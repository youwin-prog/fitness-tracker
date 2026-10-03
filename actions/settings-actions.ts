"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to load the authenticated user.");
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

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
      email: email || undefined,
      name: name || undefined,
      imageUrl: clerkUser.imageUrl || null,
    },
    create: {
      clerkUserId: userId,
      email,
      name: name || undefined,
      imageUrl: clerkUser.imageUrl || null,
    },
  });
}

async function getOrCreateUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getUserSettings() {
  const user = await getAuthenticatedUser();
  const settings = await getOrCreateUserSettings(user.id);

  return {
    darkMode: settings.darkMode,
    emailWorkoutReminders: settings.emailWorkoutReminders,
    emailNutritionReminders: settings.emailNutritionReminders,
    weeklySummaryEmail: settings.weeklySummaryEmail,
    publicProfile: settings.publicProfile,
  };
}

export async function updateDarkMode(enabled: boolean) {
  const user = await getAuthenticatedUser();

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { darkMode: enabled },
    create: { userId: user.id, darkMode: enabled },
  });

  revalidatePath("/settings");
}

export async function updateNotificationSetting(
  setting:
    | "workoutReminders"
    | "nutritionAlerts"
    | "weeklySummary",
  enabled: boolean,
) {
  const user = await getAuthenticatedUser();

  const fieldMap = {
    workoutReminders: "emailWorkoutReminders",
    nutritionAlerts: "emailNutritionReminders",
    weeklySummary: "weeklySummaryEmail",
  } as const;

  const field = fieldMap[setting];

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      [field]: enabled,
    },
    create: { userId: user.id, [field]: enabled },
  });

  revalidatePath("/settings");
}

export async function updatePublicProfile(enabled: boolean) {
  const user = await getAuthenticatedUser();

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { publicProfile: enabled },
    create: { userId: user.id, publicProfile: enabled },
  });

  revalidatePath("/settings");
}