import { createClient } from "@/lib/supabase/server";
import { Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScheduleList } from "@/components/schedules/schedule-list";

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
        vial_size_mcg,
        bac_water_ml,
        dose_per_injection_mcg,
        peptide:peptides(name)
      )
    `
    )
    .eq("user_id", user!.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })) as {
    data: any[] | null;
    error: any;
  };

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
        <ScheduleList schedules={schedules} />
      )}
    </div>
  );
}
