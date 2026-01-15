"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Target, Activity, Bell, LogOut, Pencil, Check, X } from "lucide-react";

const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Light", description: "Exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", description: "Exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Exercise 6-7 days/week" },
  { value: "very_active", label: "Very Active", description: "Hard exercise daily" },
];

const goals = [
  { value: "lose", label: "Lose Weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain Weight" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasProfile, setHasProfile] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    targetWeight: "",
    activityLevel: "moderate",
    goal: "maintain",
    notificationEmail: "",
    dailyCalories: 0,
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
              dailyCalories: data.profile.dailyCalories || 0,
            });
            setHasProfile(!!data.profile.age || !!data.profile.weight);
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

      setFormData(prev => ({ ...prev, dailyCalories: dailyCalories || 0 }));
      setMessage({ type: "success", text: "Profile saved!" });
      setHasProfile(true);
      setIsEditing(false);
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityLabel = (value: string) => {
    return activityLevels.find(a => a.value === value)?.label || value;
  };

  const getGoalLabel = (value: string) => {
    return goals.find(g => g.value === value)?.label || value;
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Profile
          </h1>
          <p className="text-sm text-zinc-500">Your personal information</p>
        </div>
        {hasProfile && !isEditing && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Success/Error Message */}
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

      {/* View Mode - Show saved profile data */}
      {hasProfile && !isEditing ? (
        <div className="space-y-4">
          {/* Calorie Target Card */}
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0">
            <CardContent className="p-4">
              <div className="text-center text-white">
                <p className="text-emerald-100 text-sm">Daily Calorie Target</p>
                <p className="text-4xl font-bold mt-1">
                  {formData.dailyCalories || calculateCalories() || "—"}
                </p>
                <p className="text-emerald-100 text-sm mt-1">calories/day</p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Age</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {formData.age || "—"} years
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Height</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {formData.height || "—"} cm
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Current Weight</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {formData.weight || "—"} kg
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Target Weight</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {formData.targetWeight || "—"} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Activity & Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Activity Level</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {getActivityLabel(formData.activityLevel)}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Goal</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {getGoalLabel(formData.goal)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Email */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Reminder Email</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {formData.notificationEmail || session?.user?.email || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account & Sign Out */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Email</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {session?.user?.email}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Name</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {session?.user?.name || "Not set"}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Edit Mode - Show form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Edit mode header */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}

          {/* Personal Info Form */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Age</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Height (cm)</label>
                  <Input
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Current Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Target Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="65"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Activity Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {activityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      formData.activityLevel === level.value
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      formData.activityLevel === level.value
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-900 dark:text-white"
                    }`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-zinc-500">{level.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-500" />
                Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g.value })}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      formData.goal === g.value
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      formData.goal === g.value
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-900 dark:text-white"
                    }`}>
                      {g.label}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Email */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-500" />
                Notification Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500 mb-2">
                Email for meal reminders. Leave empty to use account email.
              </p>
              <Input
                type="email"
                placeholder={session?.user?.email || "your@email.com"}
                value={formData.notificationEmail}
                onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>

          {/* Account & Sign Out (in edit mode) */}
          {!hasProfile && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {session?.user?.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      )}
    </div>
  );
}
