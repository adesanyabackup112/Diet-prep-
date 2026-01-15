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

const mealSlotLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const mealSlotIcons: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

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
    ).orderBy(desc(foodLogs.loggedAt)),
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

  // Group logs by meal type
  const logsByMealType: Record<string, typeof todayLogs> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  
  todayLogs.forEach((log) => {
    const mealType = log.mealType?.toLowerCase() || "snack";
    if (logsByMealType[mealType]) {
      logsByMealType[mealType].push(log);
    } else {
      logsByMealType.snack.push(log);
    }
  });

  return { profile, totals, recentMeals, todayLogs, logsByMealType, logsCount: todayLogs.length };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { profile, totals, recentMeals, logsByMealType, logsCount } = await getDashboardData(session.user.id);
  
  const dailyCalories = profile?.dailyCalories || 2000;
  const calorieProgress = Math.min((totals.calories / dailyCalories) * 100, 100);

  const macroTargets = {
    protein: Math.round(dailyCalories * 0.3 / 4),
    carbs: Math.round(dailyCalories * 0.4 / 4),
    fat: Math.round(dailyCalories * 0.3 / 9),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome section - compact on mobile */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Hi{session.user.name ? `, ${session.user.name}` : ""}! 👋
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Track your nutrition and reach your goals
        </p>
      </div>

      {/* Calorie ring - prominent on mobile */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Today&apos;s Calories</p>
            <p className="text-3xl sm:text-4xl font-bold mt-1">{totals.calories}</p>
            <p className="text-emerald-100 text-sm mt-1">of {dailyCalories} kcal</p>
          </div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${calorieProgress * 2.51} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold">{Math.round(calorieProgress)}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard/meals/log" className="flex-1">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              Log Food
            </Button>
          </Link>
        </div>
      </div>

      {/* Macro cards - horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 hide-scrollbar">
        <div className="flex-shrink-0 w-28 sm:w-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Beef className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-xs text-zinc-500">Protein</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{Math.round(totals.protein)}g</p>
          <p className="text-xs text-zinc-400">/ {macroTargets.protein}g</p>
          <Progress value={Math.min((totals.protein / macroTargets.protein) * 100, 100)} className="mt-2 h-1.5" />
        </div>

        <div className="flex-shrink-0 w-28 sm:w-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Wheat className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs text-zinc-500">Carbs</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{Math.round(totals.carbs)}g</p>
          <p className="text-xs text-zinc-400">/ {macroTargets.carbs}g</p>
          <Progress value={Math.min((totals.carbs / macroTargets.carbs) * 100, 100)} className="mt-2 h-1.5" />
        </div>

        <div className="flex-shrink-0 w-28 sm:w-auto bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Droplets className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-xs text-zinc-500">Fat</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{Math.round(totals.fat)}g</p>
          <p className="text-xs text-zinc-400">/ {macroTargets.fat}g</p>
          <Progress value={Math.min((totals.fat / macroTargets.fat) * 100, 100)} className="mt-2 h-1.5" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Today&apos;s Meals
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
              <div className="space-y-4">
                {/* Meal slots */}
                {["breakfast", "lunch", "dinner", "snack"].map((slot) => {
                  const slotLogs = logsByMealType[slot] || [];
                  const slotCalories = slotLogs.reduce((sum, log) => sum + log.calories, 0);
                  
                  return (
                    <div key={slot} className="border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mealSlotIcons[slot]}</span>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {mealSlotLabels[slot]}
                          </span>
                        </div>
                        {slotLogs.length > 0 && (
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {slotCalories} kcal
                          </span>
                        )}
                      </div>
                      {slotLogs.length > 0 ? (
                        <div className="space-y-1 ml-7">
                          {slotLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400 truncate">
                                {log.foodName}
                              </span>
                              <span className="text-zinc-500 ml-2 shrink-0">
                                {log.calories} kcal
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 ml-7">No {slot} logged</p>
                      )}
                    </div>
                  );
                })}
                
                {/* Total and add button */}
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30 mt-4">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Total Today
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
