import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="mt-2 h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="mt-3 h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="mt-2 h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
