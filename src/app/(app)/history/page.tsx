import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, mcgToMg } from "@/lib/calculations";
import { EmptyState } from "@/components/shared/empty-state";
import { History, Clock, Syringe } from "lucide-react";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: logs } = (await supabase
    .from("dose_logs")
    .select(`
      *,
      user_peptide:user_peptides(
        custom_label,
        vial_size_mcg,
        peptide:peptides(name, category, unit_type)
      )
    `)
    .eq("user_id", user!.id)
    .order("taken_at", { ascending: false })
    .limit(100)) as { data: any[] | null; error: any };

  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const log of logs || []) {
    const date = new Date(log.taken_at).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(log);
  }

  // Stats
  const totalLogs = logs?.length || 0;
  const takenCount = logs?.filter((l) => l.status === "taken").length || 0;
  const adherenceRate = totalLogs > 0 ? Math.round((takenCount / totalLogs) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {totalLogs > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-heading font-bold">{totalLogs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Taken</p>
              <p className="text-lg font-heading font-bold text-primary">{takenCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Adherence</p>
              <p className="text-lg font-heading font-bold">{adherenceRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <EmptyState
          icon={<History />}
          title="No dose history"
          description="Your dose logs will appear here once you start tracking"
          action={{ label: "Go to Dashboard", href: "/dashboard" }}
        />
      )}

      {/* Timeline */}
      {Object.entries(grouped).map(([date, dateLogs]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {date}
          </h3>
          {dateLogs.map((log: any) => {
            const peptideName =
              log.user_peptide?.custom_label ||
              log.user_peptide?.peptide?.name ||
              "Unknown";
            const isGLP1 = log.user_peptide?.peptide?.category === "weight-loss";
            const doseLabel = isGLP1 && log.dose_mcg >= 1000
              ? `${mcgToMg(log.dose_mcg)} mg`
              : `${formatNumber(log.dose_mcg)} mcg`;

            return (
              <Card key={log.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      log.status === "taken"
                        ? "bg-primary/10 text-primary"
                        : log.status === "skipped"
                        ? "bg-muted text-muted-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      <Syringe className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{peptideName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doseLabel}
                        {log.volume_ml && ` · ${formatNumber(log.volume_ml, 3)} mL`}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5 italic">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.taken_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge
                      variant={
                        log.status === "taken"
                          ? "default"
                          : log.status === "skipped"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {log.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
