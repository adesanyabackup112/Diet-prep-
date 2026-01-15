import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, profiles } from "@/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { age, weight, height, targetWeight, activityLevel, goal, dailyCalories } =
      await request.json();

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    let profile;
    if (existingProfile) {
      // Update existing profile
      [profile] = await db
        .update(profiles)
        .set({
          age,
          weight,
          height,
          targetWeight,
          activityLevel,
          goal,
          dailyCalories,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, session.user.id))
        .returning();
    } else {
      // Create new profile
      [profile] = await db
        .insert(profiles)
        .values({
          userId: session.user.id,
          age,
          weight,
          height,
          targetWeight,
          activityLevel,
          goal,
          dailyCalories,
        })
        .returning();
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
