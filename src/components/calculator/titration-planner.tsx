"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, FlaskConical } from "lucide-react";
import type { PeptideWithVariants } from "@/types/database";

interface TitrationPlannerProps {
  peptide: PeptideWithVariants;
}

interface TitrationWeek {
  weekNumber: number;
  startDate: Date;
  doseMcg: number;
  stepNumber: number;
  stepLabel: string;
  isFirstWeekOfStep: boolean;
}

export function TitrationPlanner({ peptide }: TitrationPlannerProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [selectedVariantId, setSelectedVariantId] = useState(
    peptide.variants.find((v) => v.is_default)?.id || peptide.variants[0]?.id || ""
  );

  const selectedVariant = peptide.variants.find((v) => v.id === selectedVariantId);
  const vialSizeMcg = selectedVariant?.size_mcg || peptide.typical_vial_size_mcg;

  // Build calendar
  const calendar = useMemo(() => {
    const start = new Date(startDate + "T00:00:00");
    const weeks: TitrationWeek[] = [];
    let weekNum = 1;

    for (const step of peptide.titration_steps) {
      const duration = step.duration_weeks || 4; // maintenance = show 4 weeks
      for (let w = 0; w < duration; w++) {
        const weekStart = new Date(start);
        weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
        weeks.push({
          weekNumber: weekNum,
          startDate: weekStart,
          doseMcg: step.dose_mcg,
          stepNumber: step.step_number,
          stepLabel: step.label || `Step ${step.step_number}`,
          isFirstWeekOfStep: w === 0,
        });
        weekNum++;
      }
    }
    return weeks;
  }, [startDate, peptide.titration_steps]);

  // Calculate vials needed
  const vialsNeeded = useMemo(() => {
    let totalMcg = 0;
    for (const step of peptide.titration_steps) {
      const duration = step.duration_weeks || 4;
      totalMcg += step.dose_mcg * duration; // 1 dose per week
    }
    return Math.ceil(totalMcg / vialSizeMcg);
  }, [peptide.titration_steps, vialSizeMcg]);

  // Maintenance date
  const maintenanceDate = useMemo(() => {
    const nonMaintenanceWeeks = peptide.titration_steps
      .filter((s) => s.duration_weeks > 0)
      .reduce((sum, s) => sum + s.duration_weeks, 0);
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + nonMaintenanceWeeks * 7);
    return d;
  }, [startDate, peptide.titration_steps]);

  // Generate .ics file
  const handleExportICS = () => {
    const events = calendar.map((week) => {
      const doseStr = week.doseMcg >= 1000
        ? `${(week.doseMcg / 1000).toFixed(week.doseMcg % 1000 === 0 ? 0 : 1)}mg`
        : `${week.doseMcg}mcg`;
      const dtStart = formatICSDate(week.startDate);
      const dtEnd = formatICSDate(week.startDate, 15); // 15 min duration

      return [
        "BEGIN:VEVENT",
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${peptide.name} ${doseStr} injection`,
        `DESCRIPTION:${week.stepLabel} - Week ${week.weekNumber}`,
        `UID:peptidepin-${peptide.slug}-w${week.weekNumber}@peptidepin.com`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PeptidePin//Titration Planner//EN",
      `X-WR-CALNAME:${peptide.name} Titration`,
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${peptide.slug}-titration.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Plan Your Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="touch-target"
              />
            </div>
            {peptide.variants.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vial Size</Label>
                <Select
                  value={selectedVariantId}
                  onValueChange={(v) => v && setSelectedVariantId(v)}
                >
                  <SelectTrigger className="touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {peptide.variants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.size_label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-heading font-bold text-primary">
                {vialsNeeded}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedVariant?.size_label || ""} vials needed
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">
                {calendar.length}
              </p>
              <p className="text-xs text-muted-foreground">total weeks</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-heading font-bold text-foreground">
                {maintenanceDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                reach maintenance dose
              </p>
            </div>
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            onClick={handleExportICS}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Calendar (.ics)
          </Button>
        </CardContent>
      </Card>

      {/* Week-by-week calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Week-by-Week Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {calendar.map((week) => {
              const doseStr =
                week.doseMcg >= 1000
                  ? `${(week.doseMcg / 1000).toFixed(week.doseMcg % 1000 === 0 ? 0 : 1)}mg`
                  : `${week.doseMcg}mcg`;

              return (
                <div
                  key={week.weekNumber}
                  className={`flex items-center gap-3 p-2.5 rounded-md transition-colors ${
                    week.isFirstWeekOfStep
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <span className="text-xs text-muted-foreground w-10 flex-shrink-0">
                    Wk {week.weekNumber}
                  </span>
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                    {week.startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Badge
                    variant={week.isFirstWeekOfStep ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {doseStr}
                  </Badge>
                  {week.isFirstWeekOfStep && (
                    <span className="text-xs text-primary font-medium">
                      ↑ {week.stepLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatICSDate(date: Date, addMinutes = 0): string {
  const d = new Date(date);
  d.setHours(9, 0, 0, 0); // Default to 9 AM
  if (addMinutes) d.setMinutes(d.getMinutes() + addMinutes);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
