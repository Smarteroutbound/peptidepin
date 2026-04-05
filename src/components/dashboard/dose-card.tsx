"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLogDose } from "@/hooks/use-log-dose";
import { Check, X, Syringe, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DoseCardProps {
  dose: {
    id: string;
    scheduleId: string;
    userPeptideId: string;
    peptideName: string;
    doseMcg: number;
    scheduledTime: string;
    status: "pending" | "taken" | "skipped" | "missed";
    logId: string | null;
    syringeUnits: number;
    isGLP1: boolean;
  };
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function DoseCard({ dose }: DoseCardProps) {
  const { logDose, isLogging } = useLogDose();
  const [localStatus, setLocalStatus] = useState(dose.status);

  const doseLabel = dose.isGLP1 && dose.doseMcg >= 1000
    ? `${(dose.doseMcg / 1000).toFixed(1)} mg`
    : `${dose.doseMcg} mcg`;

  async function handleTake() {
    const today = new Date().toISOString().split("T")[0];
    const result = await logDose({
      user_peptide_id: dose.userPeptideId,
      schedule_id: dose.scheduleId,
      dose_mcg: dose.doseMcg,
      // BUG FIX: Use actual scheduled time, not current time
      scheduled_at: new Date(`${today}T${dose.scheduledTime.slice(0, 5)}:00`).toISOString(),
      status: "taken",
    });
    if (result) setLocalStatus("taken");
  }

  async function handleSkip() {
    const today = new Date().toISOString().split("T")[0];
    const result = await logDose({
      user_peptide_id: dose.userPeptideId,
      schedule_id: dose.scheduleId,
      dose_mcg: dose.doseMcg,
      scheduled_at: new Date(`${today}T${dose.scheduledTime.slice(0, 5)}:00`).toISOString(),
      status: "skipped",
    });
    if (result) setLocalStatus("skipped");
  }

  const isDone = localStatus !== "pending";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={localStatus}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={isDone ? "opacity-60" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  localStatus === "taken"
                    ? "bg-primary/10 text-primary"
                    : localStatus === "skipped"
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground/50"
                }`}>
                  {localStatus === "taken" ? (
                    <Check className="h-4 w-4" />
                  ) : localStatus === "skipped" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Syringe className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{dose.peptideName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(dose.scheduledTime)} · {doseLabel}
                    {dose.syringeUnits > 0 && !isDone && (
                      <span className="text-primary"> · {dose.syringeUnits} units</span>
                    )}
                  </p>
                </div>
              </div>

              {!isDone && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground"
                    onClick={handleSkip}
                    disabled={isLogging}
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleTake}
                    disabled={isLogging}
                  >
                    {isLogging ? <Loader2 className="h-3 w-3 animate-spin" /> : "Take"}
                  </Button>
                </div>
              )}

              {isDone && (
                <span className={`text-xs font-medium ${
                  localStatus === "taken" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {localStatus}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
