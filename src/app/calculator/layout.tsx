import Link from "next/link";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header for public pages */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <Link
              href="/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer with disclaimer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-xs text-muted-foreground mb-4">
            <strong>Disclaimer:</strong> PeptidePin is for informational and
            educational purposes only. It is not intended to provide medical
            advice, diagnosis, or treatment. Always consult with a qualified
            healthcare provider before starting any peptide protocol. All
            calculations should be verified independently.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link href="/calculator" className="hover:text-foreground">
              Calculators
            </Link>
            <Link href="/bac-water-calculator" className="hover:text-foreground">
              BAC Water Calculator
            </Link>
            <Link href="/unit-converter" className="hover:text-foreground">
              Unit Converter
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} PeptidePin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
