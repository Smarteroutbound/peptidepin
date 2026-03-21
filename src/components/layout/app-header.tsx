"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-peptides": "My Vials",
  "/my-peptides/new": "Add Peptide",
  "/calculator": "Calculator",
  "/schedule": "Schedule",
  "/schedule/new": "New Schedule",
  "/history": "History",
  "/library": "Peptide Library",
  "/settings": "Settings",
  "/onboarding": "Getting Started",
};

export function AppHeader({ className }: { className?: string }) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ||
    "PeptidePin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg safe-top",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
