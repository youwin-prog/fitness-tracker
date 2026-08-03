"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const workoutTypeSchema = z.enum(["STRENGTH", "CARDIO", "MOBILITY", "RECOVERY"]);

const optionalDateString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const optionalNumber = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce.number().int().nonnegative().optional().refine((value) => value === undefined || Number.isFinite(value), {
      message,
    }),
  );

const workoutFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Workout title is required"),
  type: workoutTypeSchema,
  startedAt: z.string().min(1, "Start date is required"),
  endedAt: optionalDateString,
  durationMinutes: optionalNumber("Duration must be a valid number"),
  caloriesBurned: optionalNumber("Calories burned must be a valid number"),
  heartRateAverage: optionalNumber("Heart rate must be a valid number"),
  notes: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(500).optional()),
});

export type WorkoutFormState = {
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof workoutFormSchema>, string[]>>;
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
  const imageUrl = clerkUser.imageUrl || null;

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email,
      name,
      imageUrl,
    },
    create: {
      clerkUserId: userId,
      email,
      name,
      imageUrl,
    },
  });
}

export async function getWorkoutSessions() {
  const user = await getAuthenticatedUser();

  return prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
  });
}

export async function createWorkout(
  _previousState: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const parsed = workoutFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    type: formData.get("type"),
    startedAt: formData.get("startedAt"),
    endedAt: formData.get("endedAt") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
    caloriesBurned: formData.get("caloriesBurned") || undefined,
    heartRateAverage: formData.get("heartRateAverage") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  await prisma.workoutSession.create({
    data: {
      userId: user.id,
      title: values.title,
      type: values.type,
      startedAt: new Date(values.startedAt),
      endedAt: values.endedAt ? new Date(values.endedAt) : null,
      durationMinutes: values.durationMinutes ?? null,
      caloriesBurned: values.caloriesBurned ?? null,
      heartRateAverage: values.heartRateAverage ?? null,
      notes: values.notes?.trim() || null,
    },
  });

  revalidatePath("/workout");

  return { message: "Workout created successfully." };
}

export async function updateWorkout(
  _previousState: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const parsed = workoutFormSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    type: formData.get("type"),
    startedAt: formData.get("startedAt"),
    endedAt: formData.get("endedAt") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
    caloriesBurned: formData.get("caloriesBurned") || undefined,
    heartRateAverage: formData.get("heartRateAverage") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success || !parsed.data.id) {
    return {
      message: "Please select a workout to update.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getAuthenticatedUser();
  const values = parsed.data;

  const existingWorkout = await prisma.workoutSession.findFirst({
    where: {
      id: values.id,
      userId: user.id,
    },
  });

  if (!existingWorkout) {
    return { message: "Workout not found." };
  }

  await prisma.workoutSession.update({
    where: { id: existingWorkout.id },
    data: {
      title: values.title,
      type: values.type,
      startedAt: new Date(values.startedAt),
      endedAt: values.endedAt ? new Date(values.endedAt) : null,
      durationMinutes: values.durationMinutes ?? null,
      caloriesBurned: values.caloriesBurned ?? null,
      heartRateAverage: values.heartRateAverage ?? null,
      notes: values.notes?.trim() || null,
    },
  });

  revalidatePath("/workout");

  return { message: "Workout updated successfully." };
}

export async function deleteWorkout(formData: FormData) {
  const workoutId = z.string().min(1).parse(formData.get("id"));
  const user = await getAuthenticatedUser();

  const result = await prisma.workoutSession.deleteMany({
    where: {
      id: workoutId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    return;
  }

  revalidatePath("/workout");
}
