"use server";

import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nutritionFormSchema, type NutritionFormValues } from "@/lib/nutrition-schema";

export type NutritionActionState = {
  message?: string;
  errors?: Partial<Record<keyof NutritionFormValues, string[]>>;
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

export async function getMealEntries() {
  const user = await getAuthenticatedUser();

  return prisma.mealEntry.findMany({
    where: { userId: user.id },
    orderBy: { eatenAt: "desc" },
  });
}

export async function createMeal(input: NutritionFormValues): Promise<NutritionActionState> {
  const parsed = nutritionFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.mealEntry.create({
    data: {
      userId: user.id,
      name: values.name,
      type: values.type,
      calories: values.calories,
      proteinGrams: new Prisma.Decimal(values.proteinGrams),
      carbsGrams: new Prisma.Decimal(values.carbsGrams),
      fatGrams: new Prisma.Decimal(values.fatGrams),
      eatenAt: new Date(values.eatenAt),
    },
  });

  revalidatePath("/nutrition");

  return { message: "Meal created successfully." };
}

export async function updateMeal(input: NutritionFormValues): Promise<NutritionActionState> {
  const parsed = nutritionFormSchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select a meal to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const existingMeal = await prisma.mealEntry.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (!existingMeal) {
    return { message: "Meal not found." };
  }

  const values = parsed.data;

  await prisma.mealEntry.update({
    where: { id: existingMeal.id },
    data: {
      name: values.name,
      type: values.type,
      calories: values.calories,
      proteinGrams: new Prisma.Decimal(values.proteinGrams),
      carbsGrams: new Prisma.Decimal(values.carbsGrams),
      fatGrams: new Prisma.Decimal(values.fatGrams),
      eatenAt: new Date(values.eatenAt),
    },
  });

  revalidatePath("/nutrition");

  return { message: "Meal updated successfully." };
}

export async function deleteMeal(id: string): Promise<NutritionActionState> {
  const mealId = nutritionFormSchema.shape.id.parse(id);
  const user = await getAuthenticatedUser();

  const result = await prisma.mealEntry.deleteMany({
    where: {
      id: mealId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return { message: "Meal not found." };
  }

  revalidatePath("/nutrition");

  return { message: "Meal deleted successfully." };
}
