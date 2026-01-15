import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, plannedMeals } from "@/db";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, mealType, calories, protein, carbs, fat, plannedDate, isCompleted } = body;

    const [updatedMeal] = await db
      .update(plannedMeals)
      .set({
        title,
        description,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        plannedDate: plannedDate ? new Date(plannedDate) : undefined,
        isCompleted,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(plannedMeals.id, id),
          eq(plannedMeals.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json({ meal: updatedMeal });
  } catch (error) {
    console.error("Error updating planned meal:", error);
    return NextResponse.json(
      { error: "Failed to update planned meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedMeal] = await db
      .delete(plannedMeals)
      .where(
        and(
          eq(plannedMeals.id, id),
          eq(plannedMeals.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting planned meal:", error);
    return NextResponse.json(
      { error: "Failed to delete planned meal" },
      { status: 500 }
    );
  }
}
