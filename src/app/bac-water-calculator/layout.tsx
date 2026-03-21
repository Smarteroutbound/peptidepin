import Link from "next/link";

export default function BacWaterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border/40 bg-muted/30 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> For informational purposes only. Consult a healthcare provider before starting any peptide protocol.
          </p>
        </div>
      </footer>
    </div>
  );
}
