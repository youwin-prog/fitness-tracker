"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { weightEntrySchema, type WeightEntryFormValues } from "@/lib/weight-schema";
import type { WeightModuleData } from "@/types/weight";

export type WeightActionState = {
  message?: string;
  errors?: Partial<Record<keyof WeightEntryFormValues, string[]>>;
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

export async function getWeightModuleData(): Promise<WeightModuleData> {
  const user = await getAuthenticatedUser();

  const [profile, entries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { heightCm: true },
    }),
    prisma.progressEntry.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  return {
    heightCm: profile?.heightCm ?? null,
    entries: entries.map((entry) => ({
      id: entry.id,
      weightKg: Number(entry.weightKg ?? 0),
      recordedAt: entry.recordedAt.toISOString(),
    })),
  };
}

export async function createWeightEntry(input: WeightEntryFormValues): Promise<WeightActionState> {
  const parsed = weightEntrySchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.progressEntry.create({
    data: {
      userId: user.id,
      weightKg: new Prisma.Decimal(values.weightKg),
      recordedAt: new Date(values.recordedAt),
    },
  });

  revalidatePath("/weight");

  return { message: "Weight entry added successfully." };
}

export async function updateWeightEntry(input: WeightEntryFormValues): Promise<WeightActionState> {
  const parsed = weightEntrySchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select an entry to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const existingEntry = await prisma.progressEntry.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (!existingEntry) {
    return { message: "Weight entry not found." };
  }

  const values = parsed.data;

  await prisma.progressEntry.update({
    where: { id: existingEntry.id },
    data: {
      weightKg: new Prisma.Decimal(values.weightKg),
      recordedAt: new Date(values.recordedAt),
    },
  });

  revalidatePath("/weight");

  return { message: "Weight entry updated successfully." };
}

export async function deleteWeightEntry(id: string): Promise<WeightActionState> {
  const entryId = weightEntrySchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const result = await prisma.progressEntry.deleteMany({
    where: {
      id: entryId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return { message: "Weight entry not found." };
  }

  revalidatePath("/weight");

  return { message: "Weight entry deleted successfully." };
}
