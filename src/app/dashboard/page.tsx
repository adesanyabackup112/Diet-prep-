import { auth } from "@/auth";
import { db, profiles, foodLogs, meals } from "@/db";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Beef, 
  Wheat, 
  Droplets,
  TrendingUp,
  Target,
  Calendar,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [profileResult, todayLogs, recentMeals] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1),
    db.select().from(foodLogs).where(
      and(
        eq(foodLogs.userId, userId),
        gte(foodLogs.loggedAt, today),
        lt(foodLogs.loggedAt, tomorrow)
      )
    ),
    db.select().from(meals).where(eq(meals.userId, userId)).orderBy(desc(meals.createdAt)).limit(5),
  ]);

  const profile = profileResult[0] || null;

  const totals = todayLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { profile, totals, recentMeals, logsCount: todayLogs.length };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { profile, totals, recentMeals, logsCount } = await getDashboardData(session.user.id);
  
  const dailyCalories = profile?.dailyCalories || 2000;
  const calorieProgress = Math.min((totals.calories / dailyCalories) * 100, 100);

  const macroTargets = {
    protein: Math.round(dailyCalories * 0.3 / 4),
    carbs: Math.round(dailyCalories * 0.4 / 4),
    fat: Math.round(dailyCalories * 0.3 / 9),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back{session.user.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Track your nutrition and reach your goals
          </p>
        </div>
        <Link href="/dashboard/meals/log">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Food
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Calories
            </CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {totals.calories}
              <span className="text-sm font-normal text-zinc-500"> / {dailyCalories}</span>
            </div>
            <Progress value={calorieProgress} className="mt-3" />
            <p className="mt-2 text-xs text-zinc-500">
              {dailyCalories - totals.calories > 0 
                ? `${dailyCalories - totals.calories} remaining`
                : "Goal reached!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Protein
            </CardTitle>
            <Beef className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {Math.round(totals.protein)}g
              <span className="text-sm font-normal text-zinc-500"> / {macroTargets.protein}g</span>
            </div>
            <Progress 
              value={Math.min((totals.protein / macroTargets.protein) * 100, 100)} 
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Carbs
            </CardTitle>
            <Wheat className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {Math.round(totals.carbs)}g
              <span className="text-sm font-normal text-zinc-500"> / {macroTargets.carbs}g</span>
            </div>
            <Progress 
              value={Math.min((totals.carbs / macroTargets.carbs) * 100, 100)} 
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Fat
            </CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {Math.round(totals.fat)}g
              <span className="text-sm font-normal text-zinc-500"> / {macroTargets.fat}g</span>
            </div>
            <Progress 
              value={Math.min((totals.fat / macroTargets.fat) * 100, 100)} 
              className="mt-3" 
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Today&apos;s Log
              </CardTitle>
              <span className="text-sm text-zinc-500">{logsCount} entries</span>
            </div>
          </CardHeader>
          <CardContent>
            {logsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                  <Plus className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  No food logged today
                </p>
                <Link href="/dashboard/meals/log" className="mt-3">
                  <Button variant="outline" size="sm">
                    Log your first meal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Total Calories Today
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {totals.calories} kcal
                  </span>
                </div>
                <Link href="/dashboard/meals/log">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add more food
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Quick Stats
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Daily Goal</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {dailyCalories} kcal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Consumed</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {totals.calories} kcal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Remaining</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.max(dailyCalories - totals.calories, 0)} kcal
                </span>
              </div>
              {!profile && (
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Set up your profile for personalized goals
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {recentMeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Saved Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentMeals.map((meal: typeof recentMeals[number]) => (
                <div
                  key={meal.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <h4 className="font-medium text-zinc-900 dark:text-white">{meal.name}</h4>
                  <p className="mt-1 text-sm text-zinc-500">{meal.calories} kcal</p>
                  <span className="mt-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {meal.mealType}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
