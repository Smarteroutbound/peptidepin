"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
      const supabase = createClient();

      const { data, error } = await (supabase.from("dose_logs") as any)
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          user_peptide_id: options.user_peptide_id,
          schedule_id: options.schedule_id || null,
          dose_mcg: options.dose_mcg,
          volume_ml: options.volume_ml || null,
          scheduled_at: options.scheduled_at || null,
          taken_at: new Date().toISOString(),
          status: options.status || "taken",
          notes: options.notes || null,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to log dose", { description: error.message });
        return null;
      }

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
