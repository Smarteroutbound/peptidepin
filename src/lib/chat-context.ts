/**
 * Builds the user's stack context string passed to the AI assistant.
 *
 * Strictly read-only: no auth info, no email, no IDs exposed to the model.
 * Just the minimum a user would want the AI to reason about their setup.
 */

import { createClient } from "@/lib/supabase/server";
import { simulateRunway, runwayStatusLabel } from "@/lib/runway";
import { formatNumber, mcgToMg } from "@/lib/calculations";

export async function buildUserStackContext(userId: string): Promise<string> {
  const supabase = await createClient();

  // Fetch active vials with peptide info
  const { data: vialsRaw } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(name, category, unit_type)")
    .eq("user_id", userId)
    .eq("is_active", true)) as { data: any[] | null; error: any };

  // Fetch active schedules
  const { data: schedulesRaw } = (await supabase
    .from("dose_schedules")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)) as { data: any[] | null; error: any };

  // Recent dose logs (last 10 taken)
  const { data: recentLogs } = (await supabase
    .from("dose_logs")
    .select("taken_at, status, dose_mcg, user_peptide_id")
    .eq("user_id", userId)
    .order("taken_at", { ascending: false })
    .limit(10)) as { data: any[] | null; error: any };

  const vials = vialsRaw || [];
  const schedules = schedulesRaw || [];

  if (vials.length === 0) {
    return "The user has NO active vials yet. Suggest they add one from 'My Vials' or use the Calculator to get started.";
  }

  const sections: string[] = [];

  // Active Vials
  sections.push("## Active Vials");
  for (const vial of vials) {
    const name = vial.custom_label || vial.peptide?.name || "Unknown";
    const isGLP1 = vial.peptide?.category === "weight-loss";
    const vialSizeLabel = isGLP1
      ? `${mcgToMg(vial.vial_size_mcg)} mg`
      : `${formatNumber(vial.vial_size_mcg)} mcg`;
    const remainingLabel = isGLP1
      ? `${mcgToMg(vial.remaining_mcg || 0).toFixed(2)} mg`
      : `${formatNumber(vial.remaining_mcg || 0)} mcg`;
    const pct =
      vial.vial_size_mcg > 0
        ? Math.round(((vial.remaining_mcg || 0) / vial.vial_size_mcg) * 100)
        : 0;

    sections.push(
      `- **${name}** — ${vialSizeLabel} vial, ${remainingLabel} left (${pct}%), reconstituted with ${vial.bac_water_ml} mL BAC water${
        vial.date_reconstituted ? `, dated ${vial.date_reconstituted}` : ""
      }`
    );
  }

  // Active Schedules
  if (schedules.length > 0) {
    sections.push("\n## Active Schedules");
    for (const schedule of schedules) {
      const matchingVial = vials.find((v) => v.id === schedule.user_peptide_id);
      const name = matchingVial?.custom_label || matchingVial?.peptide?.name || "Unknown";
      const isGLP1 = matchingVial?.peptide?.category === "weight-loss";
      const doseLabel =
        isGLP1 && schedule.dose_mcg >= 1000
          ? `${(schedule.dose_mcg / 1000).toFixed(2)} mg`
          : `${schedule.dose_mcg} mcg`;
      const times = (schedule.times_of_day || [])
        .map((t: string) => t.slice(0, 5))
        .join(", ");
      sections.push(
        `- **${name}**: ${doseLabel} ${schedule.frequency.replace(/_/g, " ")} at ${times}`
      );
    }
  }

  // Runway Forecast
  const forecast = simulateRunway(vials, schedules);
  if (forecast.vials.length > 0) {
    sections.push("\n## Vial Runway");
    for (const v of forecast.vials) {
      const days = v.daysUntilEnd;
      const status = runwayStatusLabel(v.status);
      sections.push(
        `- **${v.peptideName}**: ${status}${
          days !== null ? ` (${days} days until end)` : ""
        }${v.runoutDate ? `, runs out ~${v.runoutDate.toLocaleDateString("en-US")}` : ""}`
      );
    }
  }

  // Recent activity
  if (recentLogs && recentLogs.length > 0) {
    sections.push("\n## Recent Doses (last 10)");
    for (const log of recentLogs) {
      const vial = vials.find((v) => v.id === log.user_peptide_id);
      const name = vial?.custom_label || vial?.peptide?.name || "Unknown";
      const date = new Date(log.taken_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      sections.push(
        `- ${date}: ${log.status} — ${formatNumber(log.dose_mcg)} mcg ${name}`
      );
    }
  }

  return sections.join("\n");
}
