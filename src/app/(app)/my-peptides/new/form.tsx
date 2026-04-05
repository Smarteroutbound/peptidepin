"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { addVialSchema, type AddVialInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, FlaskConical, Syringe, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  mcgToMg,
  formatNumber,
  calculateConcentration,
  calculateDosesRemaining,
} from "@/lib/calculations";
import { COMMON_VIAL_SIZES_MCG, COMMON_BAC_WATER_ML } from "@/lib/constants";
import type { Database } from "@/types/database";

type Peptide = Database["public"]["Tables"]["peptides"]["Row"];

export function AddPeptideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("peptide");
  // Pre-fill from calculator query params
  const preVialSize = Number(searchParams.get("vial_size")) || undefined;
  const preBacWater = Number(searchParams.get("bac_water")) || undefined;
  const preDose = Number(searchParams.get("dose")) || undefined;

  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddVialInput>({
    resolver: zodResolver(addVialSchema),
    defaultValues: {
      peptide_id: preselectedId || "",
      custom_label: "",
      vial_size_mcg: preVialSize || 5000,
      bac_water_ml: preBacWater || 2,
      dose_per_injection_mcg: preDose,
      notes: "",
      date_reconstituted: today,
    },
  });

  const vialSizeMcg = watch("vial_size_mcg");
  const bacWaterMl = watch("bac_water_ml");
  const dosePerInjection = watch("dose_per_injection_mcg");
  const dateReconstituted = watch("date_reconstituted");

  // Live concentration preview
  const concentration = useMemo(() => {
    if (vialSizeMcg > 0 && bacWaterMl > 0) {
      return calculateConcentration(vialSizeMcg, bacWaterMl);
    }
    return 0;
  }, [vialSizeMcg, bacWaterMl]);

  // Doses per vial preview
  const dosesPerVial = useMemo(() => {
    if (dosePerInjection && dosePerInjection > 0 && vialSizeMcg > 0) {
      return calculateDosesRemaining(vialSizeMcg, dosePerInjection);
    }
    return 0;
  }, [vialSizeMcg, dosePerInjection]);

  // Expiry date (reconstitution + 28 days)
  const expiryDate = useMemo(() => {
    if (!dateReconstituted) return null;
    const d = new Date(dateReconstituted + "T00:00:00");
    d.setDate(d.getDate() + 28);
    return d;
  }, [dateReconstituted]);

  useEffect(() => {
    async function loadPeptides() {
      const { data } = (await supabase
        .from("peptides")
        .select("*")
        .eq("is_published", true)
        .order("name")) as { data: Peptide[] | null; error: any };
      setPeptides(data || []);

      if (preselectedId && data) {
        const peptide = data.find((p) => p.id === preselectedId);
        if (peptide) {
          setValue("vial_size_mcg", peptide.typical_vial_size_mcg);
          setValue("bac_water_ml", peptide.common_bac_water_ml);
          if (peptide.recommended_dose_mcg_min) {
            setValue("dose_per_injection_mcg", peptide.recommended_dose_mcg_min);
          }
        }
      }
    }
    loadPeptides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedId]);

  async function onSubmit(data: AddVialInput) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/user-peptides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to add peptide");
        setSubmitting(false);
        return;
      }

      toast.success("Peptide added to your inventory");
      router.push("/my-peptides");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Peptide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={watch("peptide_id")}
            onValueChange={(v) => {
              if (v) {
                setValue("peptide_id", v, { shouldValidate: true });
                const peptide = peptides.find((p) => p.id === v);
                if (peptide) {
                  setValue("vial_size_mcg", peptide.typical_vial_size_mcg);
                  setValue("bac_water_ml", peptide.common_bac_water_ml);
                  if (peptide.recommended_dose_mcg_min) {
                    setValue("dose_per_injection_mcg", peptide.recommended_dose_mcg_min);
                  }
                }
              }
            }}
          >
            <SelectTrigger className="touch-target">
              <SelectValue placeholder="Choose a peptide" />
            </SelectTrigger>
            <SelectContent>
              {peptides.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.peptide_id && (
            <p className="text-xs text-destructive">{errors.peptide_id.message}</p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Custom Label (optional)
            </Label>
            <Input
              placeholder='e.g. "BPC Vial #2"'
              {...register("custom_label")}
              className="touch-target"
            />
            {errors.custom_label && (
              <p className="text-xs text-destructive">{errors.custom_label.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reconstitution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vial Size</Label>
            <Select
              value={String(vialSizeMcg)}
              onValueChange={(v) =>
                setValue("vial_size_mcg", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_VIAL_SIZES_MCG.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {mcgToMg(size)} mg
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vial_size_mcg && (
              <p className="text-xs text-destructive">{errors.vial_size_mcg.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              BAC Water Added (ml)
            </Label>
            <Select
              value={String(bacWaterMl)}
              onValueChange={(v) =>
                setValue("bac_water_ml", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_BAC_WATER_ML.map((ml) => (
                  <SelectItem key={ml} value={String(ml)}>
                    {ml} ml
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bac_water_ml && (
              <p className="text-xs text-destructive">{errors.bac_water_ml.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Dose per injection (mcg)
            </Label>
            <Input
              type="number"
              placeholder="e.g. 250"
              {...register("dose_per_injection_mcg", { valueAsNumber: true })}
              className="touch-target"
            />
            {errors.dose_per_injection_mcg && (
              <p className="text-xs text-destructive">
                {errors.dose_per_injection_mcg.message}
              </p>
            )}
          </div>

          {/* Live calculation previews */}
          {concentration > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Concentration:</span>
                <span className="font-medium">
                  {formatNumber(concentration)} mcg/mL
                </span>
              </div>
              {dosesPerVial > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Syringe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Doses per vial:</span>
                  <span className="font-medium">{dosesPerVial}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Date Reconstituted
            </Label>
            <Input
              type="date"
              {...register("date_reconstituted")}
              className="touch-target"
            />
            {expiryDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span>
                  Expires{" "}
                  {expiryDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Notes (optional)
            </Label>
            <Textarea
              placeholder="Any notes about this vial..."
              {...register("notes")}
              rows={2}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full touch-target" disabled={submitting}>
        {submitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Add to My Vials
      </Button>
    </form>
  );
}
