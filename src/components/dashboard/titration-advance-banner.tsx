"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, X, Loader2 } from "lucide-react";
import { mcgToMg } from "@/lib/calculations";

interface TitrationAdvanceBannerProps {
  schedules: any[];
  recentLogs: any[];
}

interface Suggestion {
  scheduleId: string;
  peptideName: string;
  peptideSlug: string;
  currentDoseMcg: number;
  nextDoseMcg: number;
  stepLabel: string;
  weeksAtCurrentDose: number;
  requiredWeeks: number;
}

/**
 * Smart titration advance detection.
 *
 * For each active GLP-1 schedule, checks if the user has been at the current
 * dose for enough weeks to advance to the next titration step. Shows a banner
 * suggesting the increase, with one-tap to apply.
 */
export function TitrationAdvanceBanner({ schedules, recentLogs }: TitrationAdvanceBannerProps) {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function checkTitration() {
      // Find active GLP-1 schedules
      const glp1Schedules = schedules.filter(
        (s) => s.is_active && s.user_peptide?.peptide?.category === "weight-loss"
      );
      if (glp1Schedules.length === 0) return;

      const supabase = createClient();

      for (const schedule of glp1Schedules) {
        if (dismissed.includes(schedule.id)) continue;

        const peptideSlug = schedule.user_peptide?.peptide?.slug;
        if (!peptideSlug) continue;

        // Fetch titration steps for this peptide
        const { data: peptideData } = (await supabase
          .from("peptides")
          .select("id, name, slug")
          .eq("slug", peptideSlug)
          .single()) as { data: any; error: any };

        if (!peptideData?.id) continue;

        const { data: steps } = (await supabase
          .from("peptide_titration_steps")
          .select("*")
          .eq("peptide_id", peptideData.id)
          .order("step_number", { ascending: true })) as { data: any[] | null; error: any };

        if (!steps || steps.length === 0) continue;

        // Find current step based on dose
        const currentStepIndex = steps.findIndex((s) => s.dose_mcg === schedule.dose_mcg);
        if (currentStepIndex === -1 || currentStepIndex === steps.length - 1) continue;

        const currentStep = steps[currentStepIndex];
        const nextStep = steps[currentStepIndex + 1];

        // Skip if current step has no duration (maintenance) or no next step
        if (!currentStep.duration_weeks || currentStep.duration_weeks === 0) continue;

        // Count weeks at current dose: look at dose logs matching this schedule
        const scheduleLogsForThisDose = recentLogs.filter(
          (l) =>
            l.schedule_id === schedule.id &&
            l.status === "taken" &&
            l.dose_mcg === schedule.dose_mcg
        );

        if (scheduleLogsForThisDose.length === 0) continue;

        // Oldest log at this dose = when they started this step
        const oldestLog = scheduleLogsForThisDose.reduce((oldest, l) =>
          new Date(l.taken_at) < new Date(oldest.taken_at) ? l : oldest
        );
        const weeksElapsed = Math.floor(
          (Date.now() - new Date(oldestLog.taken_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        if (weeksElapsed >= currentStep.duration_weeks) {
          setSuggestion({
            scheduleId: schedule.id,
            peptideName: peptideData.name,
            peptideSlug: peptideSlug,
            currentDoseMcg: schedule.dose_mcg,
            nextDoseMcg: nextStep.dose_mcg,
            stepLabel: nextStep.label || `Step ${nextStep.step_number}`,
            weeksAtCurrentDose: weeksElapsed,
            requiredWeeks: currentStep.duration_weeks,
          });
          return; // Show one suggestion at a time
        }
      }
    }

    checkTitration();
  }, [schedules, recentLogs, dismissed]);

  async function applyIncrease() {
    if (!suggestion) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/schedules/${suggestion.scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dose_mcg: suggestion.nextDoseMcg }),
      });
      if (!res.ok) {
        toast.error("Failed to update dose");
        return;
      }
      toast.success(`Dose increased to ${(suggestion.nextDoseMcg / 1000).toFixed(2)} mg`);
      setSuggestion(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplying(false);
    }
  }

  function dismiss() {
    if (!suggestion) return;
    setDismissed([...dismissed, suggestion.scheduleId]);
    setSuggestion(null);
  }

  if (!suggestion) return null;

  const currentMg = mcgToMg(suggestion.currentDoseMcg);
  const nextMg = mcgToMg(suggestion.nextDoseMcg);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Ready to increase your dose?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You&apos;ve been on {currentMg} mg of {suggestion.peptideName} for{" "}
              {suggestion.weeksAtCurrentDose} weeks. The titration schedule suggests moving to{" "}
              <span className="font-medium text-foreground">{nextMg} mg</span> ({suggestion.stepLabel}).
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={dismiss}
            disabled={applying}
          >
            Not yet
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={applyIncrease}
            disabled={applying}
          >
            {applying && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Increase to {nextMg} mg
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
