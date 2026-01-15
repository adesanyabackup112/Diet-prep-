import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PlannerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="mt-2 h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-2">
              <div className="p-2" />
              {[...Array(7)].map((_, i) => (
                <div key={i} className="p-2 text-center">
                  <div className="h-3 w-8 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="mt-1 h-6 w-6 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-2">
                <div className="p-3 flex items-center">
                  <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
