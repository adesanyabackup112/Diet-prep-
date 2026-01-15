import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/providers/session-provider";

const Navbar = dynamic(() => import("@/components/layout/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: true,
});

const BottomNav = dynamic(() => import("@/components/layout/bottom-nav").then(mod => ({ default: mod.BottomNav })), {
  ssr: true,
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        {/* Desktop navbar - hidden on mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-center">
            <h1 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">DietPrep</h1>
          </div>
        </header>

        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
