"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Check, X } from "lucide-react";

interface AdherenceStreakProps {
  logs: any[];
}

export function AdherenceStreak({ logs }: AdherenceStreakProps) {
  const { days, currentStreak, totalThisWeek } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build 14-day map
    const dayMap = new Map<string, { taken: number; total: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap.set(key, { taken: 0, total: 0 });
    }

    // Count logs per day
    for (const log of logs) {
      const date = new Date(log.taken_at).toISOString().split("T")[0];
      const entry = dayMap.get(date);
      if (entry) {
        entry.total++;
        if (log.status === "taken") entry.taken++;
      }
    }

    const days = Array.from(dayMap.entries()).map(([date, stats]) => ({
      date,
      label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
      dayNum: new Date(date + "T12:00:00").getDate(),
      hasDoses: stats.total > 0,
      allTaken: stats.total > 0 && stats.taken === stats.total,
      someTaken: stats.taken > 0,
    }));

    // Calculate streak
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (!days[i].hasDoses) continue; // skip days with no schedules
      if (days[i].allTaken) streak++;
      else break;
    }

    // This week total
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    let weekTaken = 0;
    let weekTotal = 0;
    for (const [date, stats] of dayMap) {
      if (date >= weekKey) {
        weekTaken += stats.taken;
        weekTotal += stats.total;
      }
    }

    return { days, currentStreak: streak, totalThisWeek: { taken: weekTaken, total: weekTotal } };
  }, [logs]);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">
              {currentStreak} day streak
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalThisWeek.taken}/{totalThisWeek.total} this week
          </span>
        </div>

        <div className="flex gap-1 justify-between">
          {days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                  day.allTaken
                    ? "bg-primary text-primary-foreground"
                    : day.someTaken
                    ? "bg-primary/20 text-primary"
                    : day.hasDoses
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground/30"
                }`}
              >
                {day.allTaken ? (
                  <Check className="h-3 w-3" />
                ) : day.hasDoses && !day.someTaken ? (
                  <X className="h-3 w-3" />
                ) : (
                  day.dayNum
                )}
              </div>
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
