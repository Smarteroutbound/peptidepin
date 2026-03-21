"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Calculator,
  CalendarClock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/my-peptides",
    label: "My Vials",
    icon: FlaskConical,
  },
  {
    href: "/calculator",
    label: "Calculate",
    icon: Calculator,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: CalendarClock,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors touch-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
