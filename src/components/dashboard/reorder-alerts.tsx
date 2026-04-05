"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Package, CalendarClock } from "lucide-react";

interface ReorderAlertsProps {
  vials: any[];
}

interface Alert {
  type: "low_stock" | "expiring" | "expired";
  vialId: string;
  vialName: string;
  message: string;
  severity: "warning" | "critical";
}

/**
 * Shows alerts for vials that need attention:
 * - Low stock (< 20% remaining)
 * - Expiring soon (within 7 days of reconstitution + 28 day shelf life)
 * - Already expired
 */
export function ReorderAlerts({ vials }: ReorderAlertsProps) {
  const alerts: Alert[] = [];

  for (const vial of vials) {
    if (!vial.is_active) continue;

    const name = vial.custom_label || vial.peptide?.name || "Vial";
    const pct = vial.vial_size_mcg > 0 ? (vial.remaining_mcg / vial.vial_size_mcg) * 100 : 0;

    // Low stock
    if (pct < 20 && pct > 0) {
      alerts.push({
        type: "low_stock",
        vialId: vial.id,
        vialName: name,
        message: `${Math.round(pct)}% remaining — time to reorder`,
        severity: pct < 10 ? "critical" : "warning",
      });
    }

    // Expiry check (28 days after reconstitution)
    if (vial.date_reconstituted) {
      const reconDate = new Date(vial.date_reconstituted + "T00:00:00");
      const expiryDate = new Date(reconDate);
      expiryDate.setDate(expiryDate.getDate() + 28);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      if (daysUntilExpiry < 0) {
        alerts.push({
          type: "expired",
          vialId: vial.id,
          vialName: name,
          message: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
          severity: "critical",
        });
      } else if (daysUntilExpiry <= 7) {
        alerts.push({
          type: "expiring",
          vialId: vial.id,
          vialName: name,
          message: `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`,
          severity: daysUntilExpiry <= 3 ? "critical" : "warning",
        });
      }
    }
  }

  if (alerts.length === 0) return null;

  // Show up to 3 alerts, prioritize critical
  const sorted = alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1)).slice(0, 3);

  return (
    <div className="space-y-2">
      {sorted.map((alert, i) => {
        const icon =
          alert.type === "low_stock" ? (
            <Package className="h-4 w-4" />
          ) : (
            <CalendarClock className="h-4 w-4" />
          );

        const colors =
          alert.severity === "critical"
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-500";

        return (
          <Link key={`${alert.vialId}-${i}`} href={`/my-peptides/${alert.vialId}`}>
            <Card className={`${colors} transition-colors hover:brightness-110`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {alert.severity === "critical" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.vialName}</p>
                    <p className="text-xs opacity-80 truncate">{alert.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
