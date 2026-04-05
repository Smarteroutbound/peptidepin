"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoseCard } from "./dose-card";
import { AdherenceStreak } from "./adherence-streak";
import { NextDoseHero } from "./next-dose-hero";
import { ManualLogSheet } from "./manual-log-sheet";
import { TitrationAdvanceBanner } from "./titration-advance-banner";
import { ReorderAlerts } from "./reorder-alerts";
import { calculateMixing, formatNumber } from "@/lib/calculations";
import { scheduleTodayNotifications } from "@/lib/notifications";
import { Calculator, Plus, ClipboardList } from "lucide-react";

interface DashboardContentProps {
  profile: any;
  schedules: any[];
  todayLogs: any[];
  recentLogs: any[];
  vials: any[];
}

interface DoseItem {
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
}

/**
 * CRITICAL BUG FIX: Match logs by schedule_id AND scheduled_at time,
 * not just schedule_id. Previous version marked all time slots as done
 * when any single slot was logged for a twice-daily schedule.
 */
function buildTodaysDoses(schedules: any[], logs: any[]): DoseItem[] {
  const today = new Date().toISOString().split("T")[0];
  const items: DoseItem[] = [];

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;

    const peptideName =
      schedule.user_peptide?.custom_label ||
      schedule.user_peptide?.peptide?.name ||
      "Unknown";
    const isGLP1 = schedule.user_peptide?.peptide?.category === "weight-loss";

    let syringeUnits = 0;
    if (schedule.user_peptide?.vial_size_mcg && schedule.user_peptide?.bac_water_ml) {
      const result = calculateMixing(
        schedule.user_peptide.vial_size_mcg,
        schedule.user_peptide.bac_water_ml,
        schedule.dose_mcg
      );
      syringeUnits = Math.round(result.syringeUnits);
    }

    const times = (schedule.times_of_day || []).map((t: string) => t.slice(0, 5));
    for (const time of times) {
      // BUG FIX: Match by schedule_id AND time slot (hour:minute)
      const matchingLog = logs.find((l) => {
        if (l.schedule_id !== schedule.id) return false;
        if (!l.scheduled_at) return false;
        const logTime = new Date(l.scheduled_at);
        const logHHMM = `${String(logTime.getHours()).padStart(2, "0")}:${String(logTime.getMinutes()).padStart(2, "0")}`;
        return logHHMM === time;
      });

      items.push({
        id: `${schedule.id}-${time}`,
        scheduleId: schedule.id,
        userPeptideId: schedule.user_peptide_id,
        peptideName,
        doseMcg: schedule.dose_mcg,
        scheduledTime: time,
        status: matchingLog ? matchingLog.status : "pending",
        logId: matchingLog?.id || null,
        syringeUnits,
        isGLP1,
      });
    }
  }

  items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  return items;
}

export function DashboardContent({
  profile,
  schedules,
  todayLogs,
  recentLogs,
  vials,
}: DashboardContentProps) {
  const [manualLogOpen, setManualLogOpen] = useState(false);

  // Schedule today's dose notifications (fires while tab is open)
  useEffect(() => {
    const cleanup = scheduleTodayNotifications(
      schedules,
      todayLogs,
      (schedule) => {
        if (!schedule.user_peptide?.vial_size_mcg || !schedule.user_peptide?.bac_water_ml) return 0;
        const result = calculateMixing(
          schedule.user_peptide.vial_size_mcg,
          schedule.user_peptide.bac_water_ml,
          schedule.dose_mcg
        );
        return Math.round(result.syringeUnits);
      }
    );
    return cleanup;
  }, [schedules, todayLogs]);

  const doses = useMemo(
    () => buildTodaysDoses(schedules, todayLogs),
    [schedules, todayLogs]
  );

  const completed = doses.filter((d) => d.status !== "pending").length;
  const total = doses.length;
  const pendingDoses = doses.filter((d) => d.status === "pending");

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextDose = pendingDoses.find((d) => {
    const [h, m] = d.scheduledTime.split(":");
    return parseInt(h) * 60 + parseInt(m) >= nowMinutes - 30;
  }) || pendingDoses[0] || null;

  const greeting = profile?.display_name
    ? `Hey, ${profile.display_name.split(" ")[0]}`
    : "Hey there";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-heading font-bold">{greeting}</h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>

      <NextDoseHero
        dose={nextDose ? {
          scheduleId: nextDose.scheduleId,
          userPeptideId: nextDose.userPeptideId,
          peptideName: nextDose.peptideName,
          doseMcg: nextDose.doseMcg,
          syringeUnits: nextDose.syringeUnits,
          scheduledTime: nextDose.scheduledTime,
          isGLP1: nextDose.isGLP1,
        } : null}
      />

      <ReorderAlerts vials={vials} />

      <TitrationAdvanceBanner schedules={schedules} recentLogs={recentLogs} />

      {total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s Doses</h2>
            <Badge variant="outline" className="text-[10px]">{completed}/{total}</Badge>
          </div>
          <div className="space-y-2">
            {doses.map((dose) => (
              <DoseCard key={dose.id} dose={dose} />
            ))}
          </div>
        </div>
      )}

      {recentLogs.length > 0 && <AdherenceStreak logs={recentLogs} />}

      {vials.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Active Vials</h2>
          <div className="grid grid-cols-2 gap-2">
            {vials.slice(0, 4).map((vial: any) => {
              const pct = vial.vial_size_mcg > 0 ? Math.round((vial.remaining_mcg / vial.vial_size_mcg) * 100) : 0;
              const name = vial.custom_label || vial.peptide?.name || "Unknown";
              return (
                <Link href={`/my-peptides/${vial.id}`} key={vial.id}>
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium truncate">{name}</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct < 20 ? "bg-destructive" : pct < 50 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{pct}% · {formatNumber(vial.remaining_mcg)} mcg</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Link href="/calculator">
          <Button variant="outline" className="w-full touch-target text-xs">
            <Calculator className="mr-1 h-3.5 w-3.5" />
            Calc
          </Button>
        </Link>
        <Link href="/my-peptides/new">
          <Button variant="outline" className="w-full touch-target text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Vial
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full touch-target text-xs"
          onClick={() => setManualLogOpen(true)}
          disabled={vials.length === 0}
        >
          <ClipboardList className="mr-1 h-3.5 w-3.5" />
          Log Dose
        </Button>
      </div>

      <ManualLogSheet open={manualLogOpen} onOpenChange={setManualLogOpen} />
    </div>
  );
}
