"use server";

import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { goalFormSchema, type GoalFormValues } from "@/lib/goal-schema";
import type { GoalModuleData } from "@/types/goal";

export type GoalActionState = {
  message?: string;
  errors?: Partial<Record<keyof GoalFormValues, string[]>>;
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

function toGoalStatus(status: "ACTIVE" | "COMPLETED") {
  return status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
}

function fromGoalStatus(status: string): "ACTIVE" | "COMPLETED" {
  return status === "COMPLETED" ? "COMPLETED" : "ACTIVE";
}

export async function getGoalModuleData(): Promise<GoalModuleData> {
  const user = await getAuthenticatedUser();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return {
    goals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      targetValue: Number(goal.targetValue ?? 0),
      currentValue: Number(goal.currentValue ?? 0),
      targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
      status: fromGoalStatus(goal.status),
    })),
  };
}

export async function createGoal(input: GoalFormValues): Promise<GoalActionState> {
  const parsed = goalFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: values.title,
      description: values.description?.trim() || null,
      targetValue: new Prisma.Decimal(values.targetValue),
      currentValue: new Prisma.Decimal(values.currentValue),
      targetDate: values.targetDate ? new Date(values.targetDate) : null,
      status: toGoalStatus(values.status),
    },
  });

  revalidatePath("/goals");

  return { message: "Goal created successfully." };
}

export async function updateGoal(input: GoalFormValues): Promise<GoalActionState> {
  const parsed = goalFormSchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select a goal to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const existingGoal = await prisma.goal.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (!existingGoal) {
    return { message: "Goal not found." };
  }

  const values = parsed.data;

  await prisma.goal.update({
    where: { id: existingGoal.id },
    data: {
      title: values.title,
      description: values.description?.trim() || null,
      targetValue: new Prisma.Decimal(values.targetValue),
      currentValue: new Prisma.Decimal(values.currentValue),
      targetDate: values.targetDate ? new Date(values.targetDate) : null,
      status: toGoalStatus(values.status),
    },
  });

  revalidatePath("/goals");

  return { message: "Goal updated successfully." };
}

export async function completeGoal(id: string): Promise<GoalActionState> {
  const goalId = goalFormSchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const existingGoal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId: user.id,
    },
  });

  if (!existingGoal) {
    return { message: "Goal not found." };
  }

  await prisma.goal.update({
    where: { id: existingGoal.id },
    data: {
      status: "COMPLETED",
      currentValue: existingGoal.targetValue ?? existingGoal.currentValue,
    },
  });

  revalidatePath("/goals");

  return { message: "Goal marked as completed." };
}

export async function deleteGoal(id: string): Promise<GoalActionState> {
  const goalId = goalFormSchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const result = await prisma.goal.deleteMany({
    where: {
      id: goalId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return { message: "Goal not found." };
  }

  revalidatePath("/goals");

  return { message: "Goal deleted successfully." };
}
