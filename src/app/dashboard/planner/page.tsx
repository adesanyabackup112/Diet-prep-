"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const mealSlots = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Meal Planner
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Plan your meals for the week
          </p>
        </div>
        <Link href="/dashboard/meals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{formatMonth()} {weekDates[0].getFullYear()}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2">
                <div className="p-2"></div>
                {weekDates.map((date, i) => (
                  <div
                    key={i}
                    className={`p-2 text-center rounded-lg ${
                      isToday(date)
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : ""
                    }`}
                  >
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {daysOfWeek[date.getDay()]}
                    </div>
                    <div
                      className={`text-lg font-semibold ${
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

              {mealSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-8 gap-2 mt-2">
                  <div className="p-3 flex items-center">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {slot}
                    </span>
                  </div>
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={`min-h-[80px] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-2 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer ${
                        isToday(date) ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      <Link
                        href={`/dashboard/meals/log?date=${date.toISOString().split("T")[0]}&meal=${slot.toLowerCase()}`}
                        className="flex items-center justify-center h-full"
                      >
                        <Plus className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>• Click on any cell to add a meal for that time slot</p>
            <p>• Plan your meals ahead to stay on track with your goals</p>
            <p>• Use saved meals from your collection for quick planning</p>
            <p>• Balance your macros throughout the day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
              <p>No meals planned yet</p>
              <p className="text-sm mt-1">Start adding meals to see your weekly summary</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
