import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()) as { data: any; error: any };

  const { data: todaysDoses } = (await supabase
    .from("dose_schedules")
    .select(
      `
      *,
      user_peptide:user_peptides(
        *,
        peptide:peptides(name, slug)
      )
    `
    )
    .eq("user_id", user!.id)
    .eq("is_active", true)) as { data: any[] | null; error: any };

  const today = new Date().toISOString().split("T")[0];
  const { data: todaysLogs } = (await supabase
    .from("dose_logs")
    .select("*")
    .eq("user_id", user!.id)
    .gte("taken_at", `${today}T00:00:00`)
    .lte("taken_at", `${today}T23:59:59`)) as { data: any[] | null; error: any };

  const { data: recentLogs } = (await supabase
    .from("dose_logs")
    .select("taken_at, status")
    .eq("user_id", user!.id)
    .eq("status", "taken")
    .order("taken_at", { ascending: false })
    .limit(30)) as { data: any[] | null; error: any };

  const { data: activeVials } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(name)")
    .eq("user_id", user!.id)
    .eq("is_active", true)) as { data: any[] | null; error: any };

  return (
    <DashboardContent
      profile={profile}
      schedules={todaysDoses || []}
      todayLogs={todaysLogs || []}
      recentLogs={recentLogs || []}
      vials={activeVials || []}
    />
  );
}
