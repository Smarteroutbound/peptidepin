"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { mcgToMg } from "@/lib/calculations";
import { COMMON_VIAL_SIZES_MCG, COMMON_BAC_WATER_ML } from "@/lib/constants";
import type { Database } from "@/types/database";

type Peptide = Database["public"]["Tables"]["peptides"]["Row"];

export function AddPeptideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("peptide");

  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [selectedPeptideId, setSelectedPeptideId] = useState(preselectedId || "");
  const [vialSizeMcg, setVialSizeMcg] = useState(5000);
  const [bacWaterMl, setBacWaterMl] = useState(2);
  const [dosePerInjection, setDosePerInjection] = useState(250);
  const [customLabel, setCustomLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

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
          setVialSizeMcg(peptide.typical_vial_size_mcg);
          setBacWaterMl(peptide.common_bac_water_ml);
          if (peptide.recommended_dose_mcg_min) {
            setDosePerInjection(peptide.recommended_dose_mcg_min);
          }
        }
      }
    }
    loadPeptides();
  }, [preselectedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPeptideId) {
      toast.error("Please select a peptide");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await (supabase.from("user_peptides") as any).insert({
      user_id: user.id,
      peptide_id: selectedPeptideId,
      custom_label: customLabel || null,
      vial_size_mcg: vialSizeMcg,
      bac_water_ml: bacWaterMl,
      dose_per_injection_mcg: dosePerInjection,
      remaining_mcg: vialSizeMcg,
      date_reconstituted: new Date().toISOString().split("T")[0],
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to add peptide");
      setLoading(false);
      return;
    }

    toast.success("Peptide added to your inventory");
    router.push("/my-peptides");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Peptide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedPeptideId}
            onValueChange={(v) => { if (v) setSelectedPeptideId(v); }}
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

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Custom Label (optional)
            </Label>
            <Input
              placeholder='e.g. "BPC Vial #2"'
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="touch-target"
            />
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
              onValueChange={(v) => setVialSizeMcg(Number(v))}
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              BAC Water Added (ml)
            </Label>
            <Select
              value={String(bacWaterMl)}
              onValueChange={(v) => setBacWaterMl(Number(v))}
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Dose per injection (mcg)
            </Label>
            <Input
              type="number"
              value={dosePerInjection || ""}
              onChange={(e) => setDosePerInjection(Number(e.target.value))}
              placeholder="e.g. 250"
              className="touch-target"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Notes (optional)
            </Label>
            <Textarea
              placeholder="Any notes about this vial..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full touch-target" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Add to My Vials
      </Button>
    </form>
  );
}
