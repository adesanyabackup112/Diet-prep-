import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, meals } from "@/db";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userMeals = await db
      .select()
      .from(meals)
      .where(eq(meals.userId, session.user.id))
      .orderBy(desc(meals.createdAt));

    return NextResponse.json({ meals: userMeals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, mealType, calories, protein, carbs, fat, scheduledAt } =
      await request.json();

    if (!name || !mealType || calories === undefined) {
      return NextResponse.json(
        { error: "Name, meal type, and calories are required" },
        { status: 400 }
      );
    }

    const [meal] = await db
      .insert(meals)
      .values({
        userId: session.user.id,
        name,
        description,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      })
      .returning();

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 });
  }
}
