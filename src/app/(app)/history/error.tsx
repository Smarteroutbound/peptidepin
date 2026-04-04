"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-heading font-semibold mb-2">Couldn&apos;t load history</h2>
      <p className="text-xs text-muted-foreground/60 mb-6 font-mono">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
