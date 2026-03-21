"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoseCard } from "./dose-card";
import { AdherenceStreak } from "./adherence-streak";
import Link from "next/link";
import {
  Calculator,
  FlaskConical,
  Plus,
  CalendarPlus,
} from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DoseLog = Database["public"]["Tables"]["dose_logs"]["Row"];

interface DashboardContentProps {
  profile: Profile | null;
  schedules: any[];
  todaysLogs: DoseLog[];
  recentLogs: { taken_at: string; status: string }[];
  activeVials: any[];
}

export function DashboardContent({
  profile,
  schedules,
  todaysLogs,
  recentLogs,
  activeVials,
}: DashboardContentProps) {
  const greeting = getGreeting();
  const displayName = profile?.display_name?.split(" ")[0] || "there";

  // Build today's dose list from schedules
  const todaysDoseItems = buildTodaysDoses(schedules, todaysLogs);
  const completedCount = todaysDoseItems.filter(
    (d) => d.status === "taken"
  ).length;
  const totalCount = todaysDoseItems.length;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="font-heading text-xl font-semibold">
          {greeting}, {displayName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Today's Doses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Today&apos;s Doses</CardTitle>
          {totalCount > 0 && (
            <Badge variant={completedCount === totalCount ? "default" : "secondary"}>
              {completedCount}/{totalCount}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {todaysDoseItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No doses scheduled for today
              </p>
              <Link href="/schedule/new">
                <Button variant="outline" size="sm">
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Create schedule
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysDoseItems.map((dose) => (
                <DoseCard key={dose.id} dose={dose} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adherence Streak */}
      {recentLogs.length > 0 && (
        <AdherenceStreak logs={recentLogs} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/calculator">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Calculator</p>
                <p className="text-xs text-muted-foreground">Mix a peptide</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/my-peptides/new">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Plus className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Add Vial</p>
                <p className="text-xs text-muted-foreground">Track a peptide</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Vials Summary */}
      {activeVials.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Active Vials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeVials.map((vial: any) => {
                const remaining = vial.remaining_mcg || 0;
                const total = vial.vial_size_mcg;
                const percent = total > 0 ? (remaining / total) * 100 : 0;
                const isLow = percent < 20;

                return (
                  <Link
                    key={vial.id}
                    href={`/my-peptides/${vial.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {vial.peptide?.name || vial.custom_label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(remaining / 1000).toFixed(1)} mg remaining
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLow ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isLow ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {Math.round(percent)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface TodayDose {
  id: string;
  peptideName: string;
  doseMcg: number;
  scheduledTime: string;
  status: "pending" | "taken" | "skipped";
  scheduleId: string;
  userPeptideId: string;
}

function buildTodaysDoses(schedules: any[], logs: DoseLog[]): TodayDose[] {
  const doses: TodayDose[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();

  for (const schedule of schedules) {
    // Check if schedule applies to today
    if (schedule.days_of_week && !schedule.days_of_week.includes(dayOfWeek)) {
      continue;
    }

    const peptideName =
      schedule.user_peptide?.peptide?.name ||
      schedule.user_peptide?.custom_label ||
      "Unknown";

    for (const time of schedule.times_of_day || []) {
      const id = `${schedule.id}-${time}`;

      // Check if there's a log for this dose
      const log = logs.find(
        (l) => l.schedule_id === schedule.id
      );

      doses.push({
        id,
        peptideName,
        doseMcg: schedule.dose_mcg,
        scheduledTime: time,
        status: log ? (log.status as "taken" | "skipped") : "pending",
        scheduleId: schedule.id,
        userPeptideId: schedule.user_peptide_id,
      });
    }
  }

  // Sort by time
  doses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  return doses;
}
