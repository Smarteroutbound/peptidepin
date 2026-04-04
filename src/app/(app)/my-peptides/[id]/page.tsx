import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MixingCalculator } from "@/components/calculator/mixing-calculator";
import {
  formatNumber,
  mcgToMg,
  calculateDosesRemaining,
} from "@/lib/calculations";
import {
  AlertTriangle,
  CalendarPlus,
  Clock,
  Droplets,
  FlaskConical,
  Syringe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VialActions } from "./vial-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = (await supabase
    .from("user_peptides")
    .select("custom_label, peptide:peptides(name)")
    .eq("id", id)
    .single()) as { data: any; error: any };

  const name = data?.custom_label || data?.peptide?.name;
  return { title: name || "Vial Detail" };
}

export default async function VialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/my-peptides");

  const { data: vial } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()) as { data: any; error: any };

  if (!vial) notFound();

  const peptide = vial.peptide;
  const remaining = vial.remaining_mcg || 0;
  const percent =
    vial.vial_size_mcg > 0 ? (remaining / vial.vial_size_mcg) * 100 : 0;
  const dosesLeft = calculateDosesRemaining(
    remaining,
    vial.dose_per_injection_mcg || 0
  );
  const isLow = percent < 20 && percent > 0 && vial.is_active;

  // Expiry calculation
  const expiryDate = vial.date_reconstituted
    ? new Date(
        new Date(vial.date_reconstituted + "T00:00:00").getTime() +
          28 * 24 * 60 * 60 * 1000
      )
    : null;
  const now = new Date();
  const daysUntilExpiry = expiryDate
    ? Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  // Recent logs
  const { data: recentLogs } = (await supabase
    .from("dose_logs")
    .select("*")
    .eq("user_peptide_id", id)
    .order("taken_at", { ascending: false })
    .limit(10)) as { data: any[] | null; error: any };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold">
              {vial.custom_label || peptide?.name}
            </h2>
            <Badge variant={vial.is_active ? "default" : "secondary"}>
              {vial.is_active ? "Active" : "Finished"}
            </Badge>
          </div>
          {vial.custom_label && peptide?.name && (
            <p className="text-sm text-muted-foreground">{peptide.name}</p>
          )}
        </div>
        <VialActions vial={vial} />
      </div>

      {/* Low stock banner */}
      {isLow && vial.is_active && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Low stock &mdash; {Math.round(percent)}% remaining ({formatNumber(mcgToMg(remaining))} mg)
          </span>
        </div>
      )}

      {/* Expiry warning */}
      {vial.is_active && isExpired && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>This vial has expired. Reconstituted peptides are typically stable for 28 days.</span>
        </div>
      )}
      {vial.is_active && isExpiringSoon && !isExpired && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Expiring soon &mdash; {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} remaining
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<FlaskConical className="h-4 w-4" />}
          label="Remaining"
          value={`${formatNumber(mcgToMg(remaining))} mg`}
          sub={`${Math.round(percent)}%`}
        />
        <StatCard
          icon={<Syringe className="h-4 w-4" />}
          label="Doses left"
          value={String(dosesLeft)}
          sub={`${formatNumber(vial.dose_per_injection_mcg || 0)} mcg each`}
        />
        <StatCard
          icon={<Droplets className="h-4 w-4" />}
          label="Concentration"
          value={`${formatNumber(vial.concentration_mcg_per_ml || 0)}`}
          sub="mcg/mL"
        />
      </div>

      {/* Remaining bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            percent < 20 ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${Math.max(percent, 1)}%` }}
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/schedule/new?vial=${id}`}>
          <Button variant="outline" className="w-full touch-target">
            <CalendarPlus className="mr-1.5 h-4 w-4" />
            Add to Schedule
          </Button>
        </Link>
        <Link href="/history">
          <Button variant="outline" className="w-full touch-target">
            <Clock className="mr-1.5 h-4 w-4" />
            History
          </Button>
        </Link>
      </div>

      {/* Integrated Calculator */}
      <MixingCalculator
        peptideName={peptide?.name}
        defaultVialSize={vial.vial_size_mcg}
        defaultBacWater={vial.bac_water_ml}
        defaultDose={vial.dose_per_injection_mcg || undefined}
        compact
      />

      {/* Recent Logs */}
      {recentLogs && recentLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Doses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(log.taken_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatNumber(log.dose_mcg)} mcg
                    </span>
                    <Badge
                      variant={
                        log.status === "taken" ? "default" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reconstitution Info */}
      {vial.date_reconstituted && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              Reconstituted on{" "}
              {new Date(vial.date_reconstituted + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {expiryDate && (
                <>
                  {" "}&middot; Expires{" "}
                  {expiryDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </>
              )}
              {vial.notes && <> &mdash; {vial.notes}</>}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <p className="font-heading text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
