import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CalendarClock } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/calculations";
import { FREQUENCIES } from "@/lib/constants";

export const metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: schedules } = (await supabase
    .from("dose_schedules")
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
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })) as { data: any[] | null; error: any };

  return (
    <div className="space-y-4">
      <Link href="/schedule/new">
        <Button className="w-full touch-target">
          <Plus className="mr-1.5 h-4 w-4" />
          New Schedule
        </Button>
      </Link>

      {(!schedules || schedules.length === 0) && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarClock className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No schedules yet</p>
            <p className="text-sm text-muted-foreground">
              Create a dose schedule to get reminders
            </p>
          </div>
        </div>
      )}

      {schedules && schedules.length > 0 && (
        <div className="space-y-2">
          {schedules.map((schedule: any) => {
            const peptideName =
              schedule.user_peptide?.peptide?.name ||
              schedule.user_peptide?.custom_label ||
              "Unknown";
            const freqLabel =
              FREQUENCIES.find((f) => f.value === schedule.frequency)?.label ||
              schedule.frequency;

            return (
              <Card key={schedule.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{peptideName}</p>
                        {!schedule.is_active && (
                          <Badge variant="outline" className="text-[10px]">
                            Paused
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatNumber(schedule.dose_mcg)} mcg &middot;{" "}
                        {freqLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {(schedule.times_of_day || [])
                        .map((t: string) => {
                          const [h, m] = t.split(":").map(Number);
                          const period = h >= 12 ? "PM" : "AM";
                          return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
                        })
                        .join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
