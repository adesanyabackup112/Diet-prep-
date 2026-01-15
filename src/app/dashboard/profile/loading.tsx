import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <Card>
        <CardHeader>
          <div className="h-7 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="mt-2 h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
