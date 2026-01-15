import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/providers/session-provider";

const Navbar = dynamic(() => import("@/components/layout/navbar").then(mod => ({ default: mod.Navbar })), {
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
