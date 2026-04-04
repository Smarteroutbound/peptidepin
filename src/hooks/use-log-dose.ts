"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LogDoseOptions {
  user_peptide_id: string;
  schedule_id?: string;
  dose_mcg: number;
  volume_ml?: number;
  scheduled_at?: string;
  status?: "taken" | "skipped" | "missed";
  notes?: string;
}

interface UseLogDoseReturn {
  logDose: (options: LogDoseOptions) => Promise<string | null>;
  isLogging: boolean;
}

const UNDO_WINDOW_MS = 5000;

export function useLogDose(): UseLogDoseReturn {
  const [isLogging, setIsLogging] = useState(false);
  const router = useRouter();
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logDose = useCallback(async (options: LogDoseOptions): Promise<string | null> => {
    setIsLogging(true);

    try {
      // H2 FIX: Use API route instead of direct Supabase insert
      // This ensures server-side validation + ownership checks
      const res = await fetch("/api/dose-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed to log dose", { description: err.error });
        return null;
      }

      const data = await res.json();
      const logId = data.id as string;
      const statusLabel = options.status === "skipped" ? "Dose skipped" : "Dose logged";

      toast.success(statusLabel, {
        description: options.status === "skipped"
          ? options.notes || "Marked as skipped"
          : `${options.dose_mcg >= 1000 ? (options.dose_mcg / 1000).toFixed(1) + " mg" : options.dose_mcg + " mcg"} recorded`,
        action: options.status !== "skipped" ? {
          label: "Undo",
          onClick: async () => {
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
            try {
              await fetch(`/api/dose-logs/${logId}`, { method: "DELETE" });
              toast.info("Dose log undone");
              router.refresh();
            } catch {
              toast.error("Couldn't undo — try deleting from history");
            }
          },
        } : undefined,
        duration: UNDO_WINDOW_MS,
      });

      router.refresh();
      return logId;
    } catch {
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [router]);

  return { logDose, isLogging };
}
