"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search, Zap, Settings2, Check, Flame, Beef, Wheat, Droplets } from "lucide-react";
import Link from "next/link";

const mealTypes = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

type FoodItem = {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
};

export default function LogFoodPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  
  const [formData, setFormData] = useState({
    foodName: "",
    mealType: "breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    servingSize: "",
  });

  // Debounced search
  const searchFoods = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.foods || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchFoods(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods]);

  const selectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
    setServings("1");
  };

  const getAdjustedNutrition = () => {
    if (!selectedFood) return null;
    const multiplier = parseFloat(servings) || 1;
    return {
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
    };
  };

  const handleSimpleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) {
      setError("Please select a food from the search results");
      return;
    }

    setIsLoading(true);
    setError("");

    const nutrition = getAdjustedNutrition()!;

    try {
      const res = await fetch("/api/food-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: selectedFood.name,
          mealType: formData.mealType,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          servingSize: `${servings} × ${selectedFood.serving}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log food");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/food-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          calories: parseInt(formData.calories) || 0,
          protein: parseFloat(formData.protein) || null,
          carbs: parseFloat(formData.carbs) || null,
          fat: parseFloat(formData.fat) || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log food");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const nutrition = getAdjustedNutrition();

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Food Logged!</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Log Food
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track what you&apos;ve eaten today
            </p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
        <button
          onClick={() => setMode("simple")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "simple"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          Simple
        </button>
        <button
          onClick={() => setMode("advanced")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "advanced"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Advanced
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {error}
        </div>
      )}

      {mode === "simple" ? (
        /* SIMPLE MODE */
        <form onSubmit={handleSimpleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-500" />
                Search Food
              </CardTitle>
              <CardDescription>
                Type to search our database of 100+ foods with nutritional info
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search for food... (e.g., chicken, rice, apple)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedFood && e.target.value !== selectedFood.name) {
                      setSelectedFood(null);
                    }
                  }}
                  className="pl-10 h-12 text-lg"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedFood && (
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  {searchResults.map((food, index) => (
                    <button
                      key={food.name}
                      type="button"
                      onClick={() => selectFood(food)}
                      className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                        index !== searchResults.length - 1 ? "border-b border-zinc-200 dark:border-zinc-700" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {food.name}
                          </div>
                          <div className="text-sm text-zinc-500">{food.serving}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {food.calories} kcal
                          </div>
                          <div className="text-xs text-zinc-500">
                            P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Food Preview */}
              {selectedFood && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white text-lg">
                        {selectedFood.name}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {selectedFood.serving}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFood(null);
                        setSearchQuery("");
                      }}
                      className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      Change
                    </button>
                  </div>

                  {/* Servings Adjuster */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Servings:
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setServings(Math.max(0.5, parseFloat(servings) - 0.5).toString())}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setServings((parseFloat(servings) + 0.5).toString())}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Nutrition Preview */}
                  {nutrition && (
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-center">
                        <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                        <div className="text-lg font-bold text-zinc-900 dark:text-white">
                          {nutrition.calories}
                        </div>
                        <div className="text-xs text-zinc-500">kcal</div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-center">
                        <Beef className="w-5 h-5 mx-auto mb-1 text-red-500" />
                        <div className="text-lg font-bold text-zinc-900 dark:text-white">
                          {nutrition.protein}g
                        </div>
                        <div className="text-xs text-zinc-500">Protein</div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-center">
                        <Wheat className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <div className="text-lg font-bold text-zinc-900 dark:text-white">
                          {nutrition.carbs}g
                        </div>
                        <div className="text-xs text-zinc-500">Carbs</div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-center">
                        <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <div className="text-lg font-bold text-zinc-900 dark:text-white">
                          {nutrition.fat}g
                        </div>
                        <div className="text-xs text-zinc-500">Fat</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>When did you eat this?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealType: type.value })}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all ${
                      formData.mealType === type.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isLoading || !selectedFood}
              className="flex-1 h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Log Food
                </>
              )}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="h-12">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      ) : (
        /* ADVANCED MODE */
        <form onSubmit={handleAdvancedSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500" />
                Manual Entry
              </CardTitle>
              <CardDescription>
                Enter exact nutritional values for precise tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Food Name *
                  </label>
                  <Input
                    placeholder="e.g., Homemade Chicken Stir Fry"
                    value={formData.foodName}
                    onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Serving Size
                  </label>
                  <Input
                    placeholder="e.g., 1 cup, 200g"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Calories *
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Beef className="w-4 h-4 text-red-500" />
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-500" />
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    Fat (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealType: type.value })}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all ${
                      formData.mealType === type.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1 h-12 text-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Log Food
                </>
              )}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="h-12">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
