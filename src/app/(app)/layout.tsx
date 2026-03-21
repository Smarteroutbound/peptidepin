import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-lg px-4 py-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
