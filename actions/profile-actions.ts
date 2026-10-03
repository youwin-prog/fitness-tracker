"use server";

import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { profileFormSchema, type ProfileFormValues } from "@/lib/profile-schema";
import type { ProfileModuleData } from "@/types/profile";

export type ProfileActionState = {
  message?: string;
  errors?: Partial<Record<keyof ProfileFormValues, string[]>>;
};

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

function calculateAge(dateOfBirth: Date | null) {
  if (!dateOfBirth) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return age;
}

function getDateOfBirthFromAge(age: number) {
  const dateOfBirth = new Date();
  dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);
  return dateOfBirth;
}

function numberOrNull(value: Prisma.Decimal | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value);
}

export async function getProfileData(): Promise<ProfileModuleData> {
  const user = (await getAuthenticatedUser()) as unknown as Prisma.UserGetPayload<{
    select: {
      id: true;
      name: true;
      email: true;
      imageUrl: true;
      clerkUserId: true;
      dateOfBirth: true;
      heightCm: true;
      weightKg: true;
    };
  }> & { gender: string | null; activityLevel: string | null; fitnessGoal: string | null };

  return {
    profile: {
      id: user.id,
      fullName: user.name ?? "",
      profileImageUrl: user.imageUrl,
      age: calculateAge(user.dateOfBirth),
      heightCm: user.heightCm ?? null,
      currentWeightKg: numberOrNull(user.weightKg),
      gender: (user.gender as ProfileModuleData["profile"]["gender"]) ?? null,
      activityLevel: (user.activityLevel as ProfileModuleData["profile"]["activityLevel"]) ?? null,
      fitnessGoal: (user.fitnessGoal as ProfileModuleData["profile"]["fitnessGoal"]) ?? null,
    },
  };
}

export async function updateProfile(input: ProfileFormValues): Promise<ProfileActionState> {
  const parsed = profileFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: values.fullName,
      imageUrl: values.profileImageUrl?.trim() || null,
      dateOfBirth: values.age ? getDateOfBirthFromAge(values.age as number) : null,
      heightCm: values.heightCm ?? null,
      weightKg: values.currentWeightKg === undefined ? null : new Prisma.Decimal(values.currentWeightKg as Prisma.Decimal.Value),
      gender: values.gender,
      activityLevel: values.activityLevel,
      fitnessGoal: values.fitnessGoal,
    } as Prisma.UserUpdateInput,
  });

  revalidatePath("/profile");

  return { message: "Profile updated successfully." };
}