"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDose } from "@/lib/calculations";
import { Check, Clock, SkipForward, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DoseCardProps {
  dose: {
    id: string;
    peptideName: string;
    doseMcg: number;
    scheduledTime: string;
    status: "pending" | "taken" | "skipped";
    scheduleId: string;
    userPeptideId: string;
  };
}

export function DoseCard({ dose }: DoseCardProps) {
  const [status, setStatus] = useState(dose.status);
  const [loading, setLoading] = useState(false);

  async function logDose(newStatus: "taken" | "skipped") {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await (supabase.from("dose_logs") as any).insert({
      user_id: user.id,
      user_peptide_id: dose.userPeptideId,
      schedule_id: dose.scheduleId,
      dose_mcg: dose.doseMcg,
      scheduled_at: new Date().toISOString(),
      status: newStatus,
    });

    if (error) {
      toast.error("Failed to log dose");
      setLoading(false);
      return;
    }

    setStatus(newStatus);
    setLoading(false);

    if (newStatus === "taken") {
      toast.success(`${dose.peptideName} dose logged`);
    }
  }

  const timeFormatted = formatTime(dose.scheduledTime);
  const isTaken = status === "taken";
  const isSkipped = status === "skipped";
  const isDone = isTaken || isSkipped;

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center justify-between rounded-lg border p-3 transition-all",
        isTaken && "border-success/30 bg-success/5",
        isSkipped && "border-muted bg-muted/30 opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            isTaken
              ? "bg-success text-success-foreground"
              : isSkipped
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {isTaken ? (
            <Check className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isDone && "line-through opacity-70"
            )}
          >
            {dose.peptideName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDose(dose.doseMcg)} &middot; {timeFormatted}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => logDose("skipped")}
              disabled={loading}
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-8 touch-target"
              onClick={() => logDose("taken")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Take
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}
