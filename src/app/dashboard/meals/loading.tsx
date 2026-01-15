import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MealsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="mt-2 h-5 w-56 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
