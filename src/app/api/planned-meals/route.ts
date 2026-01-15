import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, plannedMeals } from "@/db";
import { eq, and, gte, lt } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let meals;
    
    if (startDate && endDate) {
      // Get meals for a date range (e.g., week view)
      meals = await db
        .select()
        .from(plannedMeals)
        .where(
          and(
            eq(plannedMeals.userId, session.user.id),
            gte(plannedMeals.plannedDate, new Date(startDate)),
            lt(plannedMeals.plannedDate, new Date(endDate))
          )
        )
        .orderBy(plannedMeals.plannedDate);
    } else {
      // Get all planned meals for user
      meals = await db
        .select()
        .from(plannedMeals)
        .where(eq(plannedMeals.userId, session.user.id))
        .orderBy(plannedMeals.plannedDate);
    }

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Error fetching planned meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch planned meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, mealType, calories, protein, carbs, fat, plannedDate } = body;

    if (!title || !mealType || !plannedDate) {
      return NextResponse.json(
        { error: "Title, meal type, and planned date are required" },
        { status: 400 }
      );
    }

    const [newMeal] = await db
      .insert(plannedMeals)
      .values({
        userId: session.user.id,
        title,
        description: description || null,
        mealType,
        calories: calories || null,
        protein: protein || null,
        carbs: carbs || null,
        fat: fat || null,
        plannedDate: new Date(plannedDate),
        isCompleted: 0,
      })
      .returning();

    return NextResponse.json({ meal: newMeal }, { status: 201 });
  } catch (error) {
    console.error("Error creating planned meal:", error);
    return NextResponse.json(
      { error: "Failed to create planned meal" },
      { status: 500 }
    );
  }
}
