import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, FlaskConical, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatNumber, mcgToMg } from "@/lib/calculations";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Vials",
};

export default async function MyPeptidesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/my-peptides");

  const { data: userPeptides } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(name, slug, category)")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })) as { data: any[] | null; error: any };

  // Sort: active first, then by remaining % descending
  const sorted = (userPeptides || []).sort((a, b) => {
    // Active first
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    // Then by remaining % descending
    const pctA = a.vial_size_mcg > 0 ? (a.remaining_mcg || 0) / a.vial_size_mcg : 0;
    const pctB = b.vial_size_mcg > 0 ? (b.remaining_mcg || 0) / b.vial_size_mcg : 0;
    return pctB - pctA;
  });

  const active = sorted.filter((p) => p.is_active);
  const inactive = sorted.filter((p) => !p.is_active);

  return (
    <div className="space-y-4">
      <Link href="/my-peptides/new">
        <Button className="w-full touch-target">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Peptide
        </Button>
      </Link>

      {active.length === 0 && inactive.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FlaskConical className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No peptides yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first peptide to start tracking
            </p>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">
            Active ({active.length})
          </h3>
          {active.map((vial: any) => (
            <VialCard key={vial.id} vial={vial} />
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">
            Finished ({inactive.length})
          </h3>
          {inactive.map((vial: any) => (
            <VialCard key={vial.id} vial={vial} />
          ))}
        </div>
      )}
    </div>
  );
}

function VialCard({ vial }: { vial: any }) {
  const remaining = vial.remaining_mcg || 0;
  const total = vial.vial_size_mcg;
  const percent = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = percent < 20 && percent > 0 && vial.is_active;
  const isEmpty = remaining <= 0 && vial.is_active;

  // Expiry: reconstitution + 28 days
  const expiryDate = vial.date_reconstituted
    ? new Date(new Date(vial.date_reconstituted + "T00:00:00").getTime() + 28 * 24 * 60 * 60 * 1000)
    : null;
  const now = new Date();
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && vial.is_active;
  const isExpired =
    daysUntilExpiry !== null && daysUntilExpiry <= 0 && vial.is_active;

  const concentration = vial.concentration_mcg_per_ml || 0;

  return (
    <Link href={`/my-peptides/${vial.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-medium truncate">
                {vial.custom_label || vial.peptide?.name}
              </p>
              {!vial.is_active && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  Finished
                </Badge>
              )}
              {isEmpty && (
                <Badge variant="destructive" className="text-[10px] shrink-0">
                  Empty
                </Badge>
              )}
              {isLow && !isEmpty && (
                <Badge
                  className="text-[10px] shrink-0 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25"
                  variant="outline"
                >
                  Low
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="text-[10px] shrink-0">
                  Expired
                </Badge>
              )}
              {isExpiringSoon && !isExpired && (
                <Badge
                  className="text-[10px] shrink-0 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25"
                  variant="outline"
                >
                  <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                  {daysUntilExpiry}d left
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatNumber(mcgToMg(remaining))} / {formatNumber(mcgToMg(total))} mg
              {concentration > 0 && (
                <>
                  {" "}&middot; {formatNumber(concentration)} mcg/mL
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <div className="h-2 w-12 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  isEmpty
                    ? "bg-destructive"
                    : isLow
                      ? "bg-amber-500"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.max(percent, 2)}%` }}
              />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
