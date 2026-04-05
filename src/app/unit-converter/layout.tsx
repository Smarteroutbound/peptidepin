import { PublicHeader } from "@/components/layout/public-header";

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
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
