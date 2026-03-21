import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MixingCalculator } from "@/components/calculator/mixing-calculator";
import {
  formatNumber,
  mcgToMg,
  calculateDosesRemaining,
} from "@/lib/calculations";
import {
  CalendarPlus,
  Clock,
  Droplets,
  FlaskConical,
  Syringe,
} from "lucide-react";
import Link from "next/link";

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

  const { data: vial } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(*)")
    .eq("id", id)
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
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xl font-bold">
            {vial.custom_label || peptide?.name}
          </h2>
          <Badge
            variant={vial.is_active ? "default" : "secondary"}
          >
            {vial.is_active ? "Active" : "Finished"}
          </Badge>
        </div>
        {vial.custom_label && peptide?.name && (
          <p className="text-sm text-muted-foreground">{peptide.name}</p>
        )}
      </div>

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
          sub="mcg/ml"
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
            Schedule
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
              {new Date(vial.date_reconstituted).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {vial.notes && ` — ${vial.notes}`}
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
