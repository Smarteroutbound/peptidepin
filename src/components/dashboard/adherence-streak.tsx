"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface AdherenceStreakProps {
  logs: { taken_at: string; status: string }[];
}

export function AdherenceStreak({ logs }: AdherenceStreakProps) {
  // Build last 7 days
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const hasDose = logs.some((log) => {
      const logDate = new Date(log.taken_at).toISOString().split("T")[0];
      return logDate === dateStr;
    });

    days.push({
      date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      isToday: i === 0,
      hasDose,
    });
  }

  // Calculate current streak
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].hasDose) {
      streak++;
    } else if (!days[i].isToday) {
      break;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">7-Day Streak</CardTitle>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <Flame className="h-4 w-4" />
            {streak} day{streak !== 1 ? "s" : ""}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                  day.hasDose
                    ? "bg-primary text-primary-foreground"
                    : day.isToday
                    ? "border-2 border-dashed border-primary/50 text-muted-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {day.hasDose ? (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  day.date.getDate()
                )}
              </div>
              <span
                className={cn(
                  "text-[10px]",
                  day.isToday
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
