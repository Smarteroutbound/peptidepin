import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard } from "lucide-react";

/** Header for public pages (calculator, bac-water, unit-converter) */
export async function PublicHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold text-lg text-foreground"
        >
          <span className="text-primary">💉</span>
          PeptidePin
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/calculator"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Calculators
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
