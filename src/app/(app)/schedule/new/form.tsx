"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  createScheduleSchema,
  type CreateScheduleInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Syringe, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FREQUENCIES } from "@/lib/constants";
import { calculateMixing, formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEFAULT_TIMES: Record<string, string[]> = {
  once_daily: ["08:00"],
  twice_daily: ["08:00", "20:00"],
  three_daily: ["08:00", "14:00", "20:00"],
  every_other_day: ["08:00"],
  weekly: ["08:00"],
  biweekly: ["08:00"],
  monthly: ["08:00"],
  custom: ["08:00"],
};

export function NewScheduleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVial = searchParams.get("vial");

  const [userPeptides, setUserPeptides] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateScheduleInput>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      user_peptide_id: preselectedVial || "",
      dose_mcg: 250,
      frequency: "once_daily",
      times_of_day: ["08:00"],
      days_of_week: undefined,
      is_active: true,
    },
  });

  const selectedVialId = watch("user_peptide_id");
  const doseMcg = watch("dose_mcg");
  const frequency = watch("frequency");
  const timesOfDay = watch("times_of_day");
  const daysOfWeek = watch("days_of_week");

  const selectedVial = useMemo(
    () => userPeptides.find((v: any) => v.id === selectedVialId),
    [userPeptides, selectedVialId]
  );

  // Volume preview
  const volumePreview = useMemo(() => {
    if (!selectedVial || !doseMcg || doseMcg <= 0) return null;
    const vialSize = selectedVial.vial_size_mcg;
    const bacWater = selectedVial.bac_water_ml;
    if (!vialSize || !bacWater || vialSize <= 0 || bacWater <= 0) return null;
    const result = calculateMixing(vialSize, bacWater, doseMcg);
    return result;
  }, [selectedVial, doseMcg]);

  // Load user vials
  useEffect(() => {
    async function loadVials() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = (await supabase
        .from("user_peptides")
        .select("*, peptide:peptides(name)")
        .eq("user_id", user.id)
        .eq("is_active", true)) as { data: any[] | null; error: any };

      setUserPeptides(data || []);

      if (preselectedVial && data) {
        const vial = data.find((v: any) => v.id === preselectedVial);
        if (vial?.dose_per_injection_mcg) {
          setValue("dose_mcg", vial.dose_per_injection_mcg);
        }
      }
    }
    loadVials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedVial]);

  // When frequency changes, adjust time inputs
  useEffect(() => {
    const defaultTimes = DEFAULT_TIMES[frequency] || ["08:00"];

    if (frequency === "custom") {
      // Keep current times for custom, don't reset
      return;
    }

    setValue("times_of_day", defaultTimes);

    // Set/clear days_of_week based on frequency
    if (frequency === "weekly" || frequency === "biweekly") {
      if (!daysOfWeek || daysOfWeek.length === 0) {
        setValue("days_of_week", [1]); // Default Monday
      }
    } else {
      setValue("days_of_week", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency]);

  // When vial changes, pre-fill dose
  useEffect(() => {
    if (selectedVial?.dose_per_injection_mcg) {
      setValue("dose_mcg", selectedVial.dose_per_injection_mcg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVialId]);

  function updateTime(index: number, value: string) {
    const newTimes = [...timesOfDay];
    newTimes[index] = value;
    setValue("times_of_day", newTimes);
  }

  function addTime() {
    setValue("times_of_day", [...timesOfDay, "12:00"]);
  }

  function removeTime(index: number) {
    if (timesOfDay.length <= 1) return;
    const newTimes = timesOfDay.filter((_, i) => i !== index);
    setValue("times_of_day", newTimes);
  }

  function toggleDay(day: number) {
    const current = daysOfWeek || [];
    if (current.includes(day)) {
      const next = current.filter((d) => d !== day);
      setValue("days_of_week", next.length > 0 ? next : [day]);
    } else {
      setValue("days_of_week", [...current, day].sort());
    }
  }

  async function onSubmit(data: CreateScheduleInput) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.fields) {
          toast.error("Please fix the form errors");
        } else {
          toast.error(err.error || "Failed to create schedule");
        }
        setSubmitting(false);
        return;
      }

      toast.success("Schedule created");
      router.push("/schedule");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  }

  const isWeeklyType = frequency === "weekly" || frequency === "biweekly";
  const isCustom = frequency === "custom";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Peptide Vial */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Peptide</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedVialId}
            onValueChange={(v) => {
              if (v)
                setValue("user_peptide_id", v, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="touch-target">
              <SelectValue placeholder="Select a vial" />
            </SelectTrigger>
            <SelectContent>
              {userPeptides.map((vial: any) => (
                <SelectItem key={vial.id} value={vial.id}>
                  {vial.custom_label || vial.peptide?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.user_peptide_id && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.user_peptide_id.message}
            </p>
          )}
          {userPeptides.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              No active vials. Add a peptide first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dosing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dosing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Dose (mcg)</Label>
            <Input
              type="number"
              value={doseMcg || ""}
              onChange={(e) =>
                setValue("dose_mcg", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="touch-target"
            />
            {errors.dose_mcg && (
              <p className="text-xs text-destructive">
                {errors.dose_mcg.message}
              </p>
            )}
          </div>

          {/* Volume preview */}
          {volumePreview && volumePreview.syringeUnits > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
              <Syringe className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                = {formatNumber(volumePreview.nearestTickUnits, 0)} units on
                insulin syringe
              </span>
              <span className="text-xs text-muted-foreground">
                ({volumePreview.suggestedSyringe})
              </span>
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => {
                if (v)
                  setValue("frequency", v as CreateScheduleInput["frequency"], {
                    shouldValidate: true,
                  });
              }}
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-xs text-destructive">
                {errors.frequency.message}
              </p>
            )}
          </div>

          {/* Day of week selector for weekly/biweekly */}
          {isWeeklyType && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Day{frequency === "biweekly" ? "" : "(s)"} of Week
              </Label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, i) => {
                  const isSelected = (daysOfWeek || []).includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.days_of_week && (
                <p className="text-xs text-destructive">
                  {errors.days_of_week.message}
                </p>
              )}
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
                    className="touch-target flex-1"
                  />
                  {isCustom && timesOfDay.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeTime(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isCustom && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTime}
                className="mt-1"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Time
              </Button>
            )}
            {errors.times_of_day && (
              <p className="text-xs text-destructive">
                {errors.times_of_day.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full touch-target"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Create Schedule
      </Button>
    </form>
  );
}
