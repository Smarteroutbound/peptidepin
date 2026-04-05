"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, CalendarClock, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/calculations";
import type { RunwayForecast, RunwayStatus } from "@/lib/runway";
import { runwayStatusLabel } from "@/lib/runway";

interface RunwayForecastCardProps {
  forecast: RunwayForecast;
}

function statusColor(status: RunwayStatus) {
  switch (status) {
    case "ok":
      return "text-primary bg-primary/10";
    case "reorder_soon":
      return "text-amber-600 dark:text-amber-500 bg-amber-500/10";
    case "reorder_now":
    case "stock_out":
    case "expired":
      return "text-destructive bg-destructive/10";
  }
}

function barColor(status: RunwayStatus) {
  switch (status) {
    case "ok":
      return "bg-primary";
    case "reorder_soon":
      return "bg-amber-500";
    case "reorder_now":
    case "stock_out":
    case "expired":
      return "bg-destructive";
  }
}

function formatDaysLeft(days: number | null): string {
  if (days === null) return "No schedule";
  if (days <= 0) return "Now";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  if (weeks >= 4) return `~${Math.round(days / 7)} wks`;
  if (remainingDays === 0) return `${weeks} wk${weeks > 1 ? "s" : ""}`;
  return `${weeks}w ${remainingDays}d`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RunwayForecastCard({ forecast }: RunwayForecastCardProps) {
  // Hide the card when there's nothing useful to show
  if (forecast.overallStatus === "idle") return null;
  if (forecast.vials.length === 0) return null;

  // Only show if at least one vial has a schedule OR expiry concern
  const hasActionable = forecast.vials.some(
    (v) => v.weeklyBurnMcg > 0 || v.expiryDate !== null
  );
  if (!hasActionable) return null;

  const overallBadge =
    forecast.overallStatus === "critical" ? (
      <Badge variant="destructive" className="text-[10px]">
        <AlertCircle className="mr-1 h-3 w-3" />
        Action needed
      </Badge>
    ) : forecast.overallStatus === "attention" ? (
      <Badge className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-500/30">
        Plan ahead
      </Badge>
    ) : (
      <Badge variant="outline" className="text-[10px]">
        On track
      </Badge>
    );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-heading font-semibold">Vial Runway</h2>
          </div>
          {overallBadge}
        </div>

        {/* Summary row */}
        {forecast.earliestEndDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            <span>
              Next vial out:{" "}
              <strong className="text-foreground">
                {formatDate(forecast.earliestEndDate)}
              </strong>
            </span>
            {forecast.totalWeeklyBurnMcg > 0 && (
              <>
                <span>·</span>
                <span>
                  Burn rate: {formatNumber(forecast.totalWeeklyBurnMcg)} mcg/wk
                </span>
              </>
            )}
          </div>
        )}

        {/* Per-vial rows */}
        <div className="space-y-2">
          {forecast.vials.map((vial) => {
            const pct =
              vial.startingMcg > 0
                ? Math.max(
                    0,
                    Math.min(100, (vial.currentMcg / vial.startingMcg) * 100)
                  )
                : 0;
            const bar = barColor(vial.status);
            const color = statusColor(vial.status);

            return (
              <Link
                key={vial.vialId}
                href={`/my-peptides/${vial.vialId}`}
                className="block rounded-lg border border-border/50 bg-background/50 p-2.5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-xs font-medium truncate flex-1">
                    {vial.peptideName}
                  </p>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${color}`}
                  >
                    {runwayStatusLabel(vial.status)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${bar} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {Math.round(pct)}% ·{" "}
                    {formatNumber(vial.currentMcg)} mcg left
                  </span>
                  <span>
                    {formatDaysLeft(vial.daysUntilEnd)}
                    {vial.effectiveEndDate &&
                      ` · ${formatDate(vial.effectiveEndDate)}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
