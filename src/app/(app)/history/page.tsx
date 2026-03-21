import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/calculations";
import { History } from "lucide-react";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = (await supabase
    .from("dose_logs")
    .select(
      `
      *,
      user_peptide:user_peptides(
        custom_label,
        peptide:peptides(name)
      )
    `
    )
    .eq("user_id", user!.id)
    .order("taken_at", { ascending: false })
    .limit(50)) as { data: any[] | null; error: any };

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

  return (
    <div className="space-y-4">
      {Object.keys(grouped).length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <History className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No dose history</p>
            <p className="text-sm text-muted-foreground">
              Your dose logs will appear here
            </p>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([date, dateLogs]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">
            {date}
          </h3>
          {dateLogs.map((log: any) => {
            const peptideName =
              log.user_peptide?.peptide?.name ||
              log.user_peptide?.custom_label ||
              "Unknown";

            return (
              <Card key={log.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{peptideName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(log.dose_mcg)} mcg
                      {log.volume_ml &&
                        ` · ${formatNumber(log.volume_ml, 3)} ml`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
