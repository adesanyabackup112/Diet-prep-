"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Trash2 } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const mealSlots = ["breakfast", "lunch", "dinner", "snack"];
const mealSlotLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

type PlannedMeal = {
  id: string;
  title: string;
  description?: string;
  mealType: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  plannedDate: string;
  isCompleted: number;
};

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const getWeekDates = useCallback(() => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  }, [currentDate]);

  const weekDates = getWeekDates();

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = weekDates[0].toISOString();
      const endDate = new Date(weekDates[6]);
      endDate.setDate(endDate.getDate() + 1);
      
      const res = await fetch(`/api/planned-meals?startDate=${startDate}&endDate=${endDate.toISOString()}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [weekDates]);

  useEffect(() => {
    fetchMeals();
  }, [currentDate]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatMonth = () => {
    const months = weekDates.map((d) => d.getMonth());
    const uniqueMonths = [...new Set(months)];
    const monthNames = uniqueMonths.map((m) =>
      new Date(2024, m, 1).toLocaleString("default", { month: "long" })
    );
    return monthNames.join(" - ");
  };

  const getMealsForSlot = (date: Date, slot: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return meals.filter((meal) => {
      const mealDate = new Date(meal.plannedDate).toISOString().split("T")[0];
      return mealDate === dateStr && meal.mealType === slot;
    });
  };

  const openAddModal = (date: Date, slot: string) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setFormData({ title: "", description: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowModal(true);
  };

  const handleSaveMeal = async () => {
    if (!selectedDate || !selectedSlot || !formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/planned-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          mealType: selectedSlot,
          calories: formData.calories ? parseInt(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          plannedDate: selectedDate.toISOString(),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchMeals();
      }
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const res = await fetch(`/api/planned-meals/${mealId}`, { method: "DELETE" });
      if (res.ok) {
        fetchMeals();
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Meal Planner
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Plan your meals for the week
        </p>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base sm:text-lg">{formatMonth()} {weekDates[0].getFullYear()}</CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="min-w-[700px]">
                {/* Day headers */}
                <div className="grid grid-cols-8 gap-1 sm:gap-2">
                  <div className="p-1 sm:p-2"></div>
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={`p-1 sm:p-2 text-center rounded-lg ${
                        isToday(date) ? "bg-emerald-100 dark:bg-emerald-900/30" : ""
                      }`}
                    >
                      <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                        {daysOfWeek[date.getDay()]}
                      </div>
                      <div
                        className={`text-sm sm:text-lg font-semibold ${
                          isToday(date)
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-white"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal slots */}
                {mealSlots.map((slot) => (
                  <div key={slot} className="grid grid-cols-8 gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <div className="p-1 sm:p-2 flex items-center">
                      <span className="text-[10px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {mealSlotLabels[slot]}
                      </span>
                    </div>
                    {weekDates.map((date, i) => {
                      const slotMeals = getMealsForSlot(date, slot);
                      return (
                        <div
                          key={i}
                          onClick={() => openAddModal(date, slot)}
                          className={`min-h-[60px] sm:min-h-[80px] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-1 sm:p-2 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer ${
                            isToday(date) ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                          }`}
                        >
                          {slotMeals.length > 0 ? (
                            <div className="space-y-1">
                              {slotMeals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="bg-emerald-100 dark:bg-emerald-900/50 rounded p-1 text-[10px] sm:text-xs group relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="font-medium text-emerald-800 dark:text-emerald-200 truncate pr-4">
                                    {meal.title}
                                  </div>
                                  {meal.calories && (
                                    <div className="text-emerald-600 dark:text-emerald-400">
                                      {meal.calories} kcal
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleDeleteMeal(meal.id)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500 hover:text-red-700" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Plus className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{meals.length}</div>
                <div className="text-xs text-zinc-500">Meals Planned</div>
              </div>
              <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{totalCalories}</div>
                <div className="text-xs text-zinc-500">Total Calories</div>
              </div>
              <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {Math.round(totalCalories / 7)}
                </div>
                <div className="text-xs text-zinc-500">Avg/Day</div>
              </div>
              <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {meals.filter(m => m.isCompleted).length}
                </div>
                <div className="text-xs text-zinc-500">Completed</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
              <p>No meals planned yet</p>
              <p className="text-sm mt-1">Click on any cell to add a meal</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Add Meal - {mealSlotLabels[selectedSlot]}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            
            <p className="text-sm text-zinc-500">
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Meal Name *
                </label>
                <Input
                  placeholder="e.g., Grilled Chicken Salad"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <Input
                  placeholder="Add notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Calories
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Fat (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveMeal}
                disabled={isSaving || !formData.title.trim()}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Meal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
