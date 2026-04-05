import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

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
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} PeptidePin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
