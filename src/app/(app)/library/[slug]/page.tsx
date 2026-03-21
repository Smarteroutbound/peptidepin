import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mcgToMg, formatNumber } from "@/lib/calculations";
import {
  FlaskConical,
  Clock,
  Thermometer,
  Droplets,
  Plus,
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: peptide } = (await supabase
    .from("peptides")
    .select("name")
    .eq("slug", slug)
    .single()) as { data: any; error: any };

  return { title: peptide?.name || "Peptide" };
}

export default async function PeptideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: peptide } = (await supabase
    .from("peptides")
    .select("*")
    .eq("slug", slug)
    .single()) as { data: any; error: any };

  if (!peptide) notFound();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xl font-bold">{peptide.name}</h2>
          {peptide.category && (
            <Badge variant="secondary" className="capitalize">
              {peptide.category}
            </Badge>
          )}
        </div>
        {peptide.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {peptide.description}
          </p>
        )}
      </div>

      <Link href={`/my-peptides/new?peptide=${peptide.id}`}>
        <Button className="w-full touch-target">
          <Plus className="mr-1.5 h-4 w-4" />
          Add to My Vials
        </Button>
      </Link>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dosing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            icon={<FlaskConical className="h-4 w-4" />}
            label="Typical vial size"
            value={`${mcgToMg(peptide.typical_vial_size_mcg)} mg`}
          />
          {(peptide.recommended_dose_mcg_min || peptide.recommended_dose_mcg_max) && (
            <InfoRow
              icon={<Droplets className="h-4 w-4" />}
              label="Recommended dose"
              value={`${formatNumber(peptide.recommended_dose_mcg_min || 0)} - ${formatNumber(
                peptide.recommended_dose_mcg_max || 0
              )} mcg`}
            />
          )}
          {peptide.recommended_frequency && (
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Frequency"
              value={peptide.recommended_frequency}
            />
          )}
          {peptide.half_life_hours && (
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Half-life"
              value={
                peptide.half_life_hours >= 24
                  ? `${formatNumber(peptide.half_life_hours / 24)} days`
                  : `${formatNumber(peptide.half_life_hours)} hours`
              }
            />
          )}
          <InfoRow
            icon={<Droplets className="h-4 w-4" />}
            label="Common BAC water"
            value={`${peptide.common_bac_water_ml} ml`}
          />
        </CardContent>
      </Card>

      {peptide.reconstitution_notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reconstitution Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {peptide.reconstitution_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {peptide.storage_instructions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-4 w-4 text-primary" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {peptide.storage_instructions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
