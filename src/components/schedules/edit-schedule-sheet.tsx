"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Syringe, Plus, X } from "lucide-react";
import { FREQUENCIES } from "@/lib/constants";
import { calculateMixing, formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface EditScheduleSheetProps {
  schedule: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEFAULT_TIMES: Record<string, string[]> = {
  once_daily: ["08:00"],
  twice_daily: ["08:00", "20:00"],
  three_daily: ["08:00", "14:00", "20:00"],
  every_other_day: ["08:00"],
  weekly: ["08:00"],
  custom: ["08:00"],
};

export function EditScheduleSheet({ schedule, open, onOpenChange }: EditScheduleSheetProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [doseMcg, setDoseMcg] = useState<number>(schedule?.dose_mcg || 250);
  const [frequency, setFrequency] = useState<string>(schedule?.frequency || "once_daily");
  const [timesOfDay, setTimesOfDay] = useState<string[]>(schedule?.times_of_day || ["08:00"]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[] | undefined>(schedule?.days_of_week);

  // Reset form when schedule changes
  useEffect(() => {
    if (schedule) {
      setDoseMcg(schedule.dose_mcg);
      setFrequency(schedule.frequency);
      setTimesOfDay(schedule.times_of_day || ["08:00"]);
      setDaysOfWeek(schedule.days_of_week);
    }
  }, [schedule]);

  const vial = schedule?.user_peptide;
  const peptideName = vial?.custom_label || vial?.peptide?.name || "Unknown";
  const isGLP1 = vial?.peptide?.category === "weight-loss";

  // Live volume preview
  const volumePreview = (() => {
    if (!vial?.vial_size_mcg || !vial?.bac_water_ml || !doseMcg || doseMcg <= 0) return null;
    return calculateMixing(vial.vial_size_mcg, vial.bac_water_ml, doseMcg);
  })();

  function handleFrequencyChange(newFreq: string) {
    setFrequency(newFreq);
    if (newFreq !== "custom") {
      setTimesOfDay(DEFAULT_TIMES[newFreq] || ["08:00"]);
    }
    if (newFreq === "weekly") {
      if (!daysOfWeek || daysOfWeek.length === 0) setDaysOfWeek([1]);
    } else {
      setDaysOfWeek(undefined);
    }
  }

  function updateTime(index: number, value: string) {
    const next = [...timesOfDay];
    next[index] = value;
    setTimesOfDay(next);
  }

  function addTime() {
    setTimesOfDay([...timesOfDay, "12:00"]);
  }

  function removeTime(index: number) {
    if (timesOfDay.length <= 1) return;
    setTimesOfDay(timesOfDay.filter((_, i) => i !== index));
  }

  function toggleDay(day: number) {
    const current = daysOfWeek || [];
    if (current.includes(day)) {
      const next = current.filter((d) => d !== day);
      setDaysOfWeek(next.length > 0 ? next : [day]);
    } else {
      setDaysOfWeek([...current, day].sort());
    }
  }

  async function handleSubmit() {
    if (!doseMcg || doseMcg <= 0) {
      toast.error("Dose must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dose_mcg: doseMcg,
          frequency,
          times_of_day: timesOfDay,
          days_of_week: daysOfWeek,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update schedule");
        return;
      }

      toast.success("Schedule updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!schedule) return null;

  const isWeekly = frequency === "weekly";
  const isCustom = frequency === "custom";
  const doseLabel = isGLP1 && doseMcg >= 1000 ? `${(doseMcg / 1000).toFixed(2)} mg` : `${doseMcg} mcg`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <p className="text-sm text-muted-foreground">{peptideName}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Dose */}
          <div className="space-y-1.5">
            <Label htmlFor="dose" className="text-xs text-muted-foreground">
              Dose {isGLP1 ? "(mg)" : "(mcg)"}
            </Label>
            {isGLP1 ? (
              <Input
                id="dose"
                type="number"
                step="0.01"
                value={doseMcg / 1000 || ""}
                onChange={(e) => setDoseMcg(Number(e.target.value) * 1000)}
                className="h-11"
              />
            ) : (
              <Input
                id="dose"
                type="number"
                step="any"
                value={doseMcg || ""}
                onChange={(e) => setDoseMcg(Number(e.target.value))}
                className="h-11"
              />
            )}
            <p className="text-xs text-muted-foreground">= {doseLabel}</p>
          </div>

          {/* Volume preview */}
          {volumePreview && volumePreview.syringeUnits > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2.5 text-sm">
              <Syringe className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                = {formatNumber(volumePreview.nearestTickUnits, 0)} units on{" "}
                {volumePreview.suggestedSyringe} syringe
              </span>
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <select
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Day of week for weekly */}
          {isWeekly && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Day(s) of Week</Label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, i) => {
                  const selected = (daysOfWeek || []).includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Times of day */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Time{timesOfDay.length > 1 ? "s" : ""} of Day
            </Label>
            <div className="space-y-2">
              {timesOfDay.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="h-11 flex-1"
                  />
                  {isCustom && timesOfDay.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTime(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isCustom && (
              <Button type="button" variant="outline" size="sm" onClick={addTime} className="mt-1">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add time
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
