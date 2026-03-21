import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, FlaskConical } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Vials",
};

export default async function MyPeptidesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userPeptides } = (await supabase
    .from("user_peptides")
    .select("*, peptide:peptides(name, slug, category)")
    .eq("user_id", user!.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })) as { data: any[] | null; error: any };

  const active = userPeptides?.filter((p) => p.is_active) || [];
  const inactive = userPeptides?.filter((p) => !p.is_active) || [];

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
  const isLow = percent < 20 && vial.is_active;

  return (
    <Link href={`/my-peptides/${vial.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {vial.custom_label || vial.peptide?.name}
              </p>
              {!vial.is_active && (
                <Badge variant="outline" className="text-[10px]">
                  Finished
                </Badge>
              )}
              {isLow && (
                <Badge variant="destructive" className="text-[10px]">
                  Low
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {(remaining / 1000).toFixed(1)} / {(total / 1000).toFixed(1)} mg
              &middot; {vial.concentration_mcg_per_ml?.toFixed(0)} mcg/ml
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-12 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  isLow ? "bg-destructive" : "bg-primary"
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
