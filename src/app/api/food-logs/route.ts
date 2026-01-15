import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, foodLogs } from "@/db";
import { eq, and, gte, lt, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let logs;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      logs = await db
        .select()
        .from(foodLogs)
        .where(
          and(
            eq(foodLogs.userId, session.user.id),
            gte(foodLogs.loggedAt, startDate),
            lt(foodLogs.loggedAt, endDate)
          )
        )
        .orderBy(desc(foodLogs.loggedAt));
    } else {
      logs = await db
        .select()
        .from(foodLogs)
        .where(eq(foodLogs.userId, session.user.id))
        .orderBy(desc(foodLogs.loggedAt));
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching food logs:", error);
    return NextResponse.json({ error: "Failed to fetch food logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { foodName, mealType, calories, protein, carbs, fat, servingSize, loggedAt } =
      await request.json();

    if (!foodName || !mealType || calories === undefined) {
      return NextResponse.json(
        { error: "Food name, meal type, and calories are required" },
        { status: 400 }
      );
    }

    const [log] = await db
      .insert(foodLogs)
      .values({
        userId: session.user.id,
        foodName,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        servingSize,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      })
      .returning();

    return NextResponse.json({ log });
  } catch (error) {
    console.error("Error creating food log:", error);
    return NextResponse.json({ error: "Failed to log food" }, { status: 500 });
  }
}
