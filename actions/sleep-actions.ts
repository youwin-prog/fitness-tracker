"use server";

import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sleepEntrySchema, type SleepEntryFormValues } from "@/lib/sleep-schema";
import type { SleepModuleData } from "@/types/sleep";

export type SleepActionState = {
  message?: string;
  errors?: Partial<Record<keyof SleepEntryFormValues, string[]>>;
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

export async function getSleepModuleData(): Promise<SleepModuleData> {
  const user = await getAuthenticatedUser();

  const entries = await prisma.sleepEntry.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
  });

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      sleepHours: Number(entry.sleepHours),
      quality: entry.quality,
      recordedAt: entry.recordedAt.toISOString(),
    })),
  };
}

export async function createSleepEntry(input: SleepEntryFormValues): Promise<SleepActionState> {
  const parsed = sleepEntrySchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.sleepEntry.create({
    data: {
      userId: user.id,
      sleepHours: new Prisma.Decimal(values.sleepHours),
      quality: values.quality,
      recordedAt: new Date(values.recordedAt),
    },
  });

  revalidatePath("/sleep");

  return { message: "Sleep entry added successfully." };
}

export async function updateSleepEntry(input: SleepEntryFormValues): Promise<SleepActionState> {
  const parsed = sleepEntrySchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select an entry to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const existingEntry = await prisma.sleepEntry.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (!existingEntry) {
    return { message: "Sleep entry not found." };
  }

  const values = parsed.data;

  await prisma.sleepEntry.update({
    where: { id: existingEntry.id },
    data: {
      sleepHours: new Prisma.Decimal(values.sleepHours),
      quality: values.quality,
      recordedAt: new Date(values.recordedAt),
    },
  });

  revalidatePath("/sleep");

  return { message: "Sleep entry updated successfully." };
}

export async function deleteSleepEntry(id: string): Promise<SleepActionState> {
  const entryId = sleepEntrySchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const result = await prisma.sleepEntry.deleteMany({
    where: {
      id: entryId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return { message: "Sleep entry not found." };
  }

  revalidatePath("/sleep");

  return { message: "Sleep entry deleted successfully." };
}
