"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Target, Activity, Bell, LogOut } from "lucide-react";

const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Light", description: "Exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", description: "Exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Exercise 6-7 days/week" },
  { value: "very_active", label: "Very Active", description: "Hard exercise daily" },
];

const goals = [
  { value: "lose", label: "Lose Weight", description: "Calorie deficit" },
  { value: "maintain", label: "Maintain", description: "Stay at current weight" },
  { value: "gain", label: "Gain Weight", description: "Calorie surplus" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    targetWeight: "",
    activityLevel: "moderate",
    goal: "maintain",
    notificationEmail: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData({
              age: data.profile.age?.toString() || "",
              weight: data.profile.weight?.toString() || "",
              height: data.profile.height?.toString() || "",
              targetWeight: data.profile.targetWeight?.toString() || "",
              activityLevel: data.profile.activityLevel || "moderate",
              goal: data.profile.goal || "maintain",
              notificationEmail: data.profile.notificationEmail || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const calculateCalories = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    if (!weight || !height || !age) return null;

    // Mifflin-St Jeor Equation (assuming male, can be adjusted)
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.55);

    if (formData.goal === "lose") tdee -= 500;
    if (formData.goal === "gain") tdee += 500;

    return Math.round(tdee);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const dailyCalories = calculateCalories();

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(formData.age) || null,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          targetWeight: parseFloat(formData.targetWeight) || null,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          dailyCalories,
          notificationEmail: formData.notificationEmail || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedCalories = calculateCalories();

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Set up your profile for personalized nutrition goals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic information helps us calculate your daily needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                  <div
                    className={`p-3 text-sm rounded-lg ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-red-50 text-red-500 dark:bg-red-950/50"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Age
                    </label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Current Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Height (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Target Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="65"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Level
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          formData.activityLevel === level.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`font-medium ${
                            formData.activityLevel === level.value
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {level.label}
                        </div>
                        <div className="text-xs text-zinc-500">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goal
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {goals.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: g.value })}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          formData.goal === g.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`font-medium ${
                            formData.goal === g.value
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {g.label}
                        </div>
                        <div className="text-xs text-zinc-500">{g.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-6">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-500" />
                    Notification Email
                  </label>
                  <p className="text-xs text-zinc-500">
                    Email address for meal reminders. Leave empty to use your account email.
                  </p>
                  <Input
                    type="email"
                    placeholder={session?.user?.email || "your@email.com"}
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Calorie Target</CardTitle>
            </CardHeader>
            <CardContent>
              {estimatedCalories ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {estimatedCalories}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">calories/day</div>
                  <p className="text-xs text-zinc-400 mt-4">
                    Based on your profile and goals
                  </p>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-4">
                  <p>Fill in your profile to see your recommended daily calories</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-zinc-500">Email</div>
                <div className="font-medium text-zinc-900 dark:text-white">
                  {session?.user?.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Name</div>
                <div className="font-medium text-zinc-900 dark:text-white">
                  {session?.user?.name || "Not set"}
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
