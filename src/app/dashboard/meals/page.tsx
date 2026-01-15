import { auth } from "@/auth";
import { db, meals } from "@/db";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.userId, session.user.id))
    .orderBy(desc(meals.createdAt));

  const mealsByType = {
    breakfast: userMeals.filter((m) => m.mealType === "breakfast"),
    lunch: userMeals.filter((m) => m.mealType === "lunch"),
    dinner: userMeals.filter((m) => m.mealType === "dinner"),
    snack: userMeals.filter((m) => m.mealType === "snack"),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            My Meals
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Save and manage your favorite meals
          </p>
        </div>
        <Link href="/dashboard/meals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Meal
          </Button>
        </Link>
      </div>

      {userMeals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
              <UtensilsCrossed className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
              No meals yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Create your first meal to get started
            </p>
            <Link href="/dashboard/meals/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Meal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="capitalize">{type}</CardTitle>
              </CardHeader>
              <CardContent>
                {mealsByType[type].length === 0 ? (
                  <p className="text-sm text-zinc-500">No {type} meals saved</p>
                ) : (
                  <div className="space-y-3">
                    {mealsByType[type].map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div>
                          <h4 className="font-medium text-zinc-900 dark:text-white">
                            {meal.name}
                          </h4>
                          <p className="text-sm text-zinc-500">
                            {meal.calories} kcal
                            {meal.protein && ` • ${meal.protein}g protein`}
                          </p>
                        </div>
                        <Link href={`/dashboard/meals/log?mealId=${meal.id}`}>
                          <Button variant="outline" size="sm">
                            Log
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
