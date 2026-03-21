"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SyringeVisual } from "./syringe-visual";
import { MathBreakdown } from "./math-breakdown";
import {
  calculateMixing,
  formatNumber,
  mcgToMg,
} from "@/lib/calculations";
import {
  COMMON_BAC_WATER_ML,
  SYRINGE_TYPES,
} from "@/lib/constants";
import { FlaskConical, Droplets, Target, Syringe, DollarSign } from "lucide-react";
import type { PeptideWithVariants, PeptideVariant, SyringeType } from "@/types/database";

interface CalculatorV2Props {
  /** Full peptide data with variants */
  peptide?: PeptideWithVariants;
  /** Pre-select a specific variant */
  defaultVariant?: PeptideVariant;
  /** Show cost-per-dose input */
  showCost?: boolean;
  /** Compact mode for embedding */
  compact?: boolean;
  /** Sync state to URL params */
  syncUrl?: boolean;
}

export function CalculatorV2({
  peptide,
  defaultVariant,
  showCost = true,
  compact = false,
  syncUrl = true,
}: CalculatorV2Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if this is IU-based
  const isIU = peptide?.unit_type === "iu";
  const unitLabel = isIU ? "IU" : "mcg";
  const unitLabelLower = isIU ? "IU" : "mcg";

  // Get defaults from variant or peptide or URL params
  const getDefault = (key: string, fallback: number) => {
    if (syncUrl) {
      const param = searchParams.get(key);
      if (param) return Number(param);
    }
    return fallback;
  };

  const variants = peptide?.variants || [];
  const sortedVariants = [...variants].sort((a, b) => a.sort_order - b.sort_order);
  const selectedDefault = defaultVariant || sortedVariants.find((v) => v.is_default) || sortedVariants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(
    selectedDefault?.id || ""
  );
  const [vialSize, setVialSize] = useState(
    getDefault("vial", selectedDefault?.size_mcg || peptide?.typical_vial_size_mcg || 5000)
  );
  const [bacWaterMl, setBacWaterMl] = useState(
    getDefault("bac", selectedDefault?.common_bac_water_ml || peptide?.common_bac_water_ml || 2)
  );
  const [desiredDose, setDesiredDose] = useState(
    getDefault("dose", peptide?.recommended_dose_mcg_min || 250)
  );
  const [syringeType, setSyringeType] = useState<SyringeType>(
    (searchParams.get("syringe") as SyringeType) || "1.0ml"
  );
  const [vialPrice, setVialPrice] = useState<number | null>(
    searchParams.get("price") ? Number(searchParams.get("price")) : null
  );

  // Calculate results in real-time
  const result = useMemo(() => {
    const mixing = calculateMixing(vialSize, bacWaterMl, desiredDose);

    // Cost per dose
    const costPerDose = vialPrice && mixing.dosesPerVial > 0
      ? vialPrice / mixing.dosesPerVial
      : null;

    // Syringe tick snapping
    const tickInterval = syringeType === "1.0ml" ? 2 : 1;
    const snappedUnits = Math.round(mixing.syringeUnits / tickInterval) * tickInterval;

    return {
      ...mixing,
      costPerDose,
      snappedUnits,
      tickInterval,
    };
  }, [vialSize, bacWaterMl, desiredDose, syringeType, vialPrice]);

  // Get syringe max units for visual
  const syringeMaxUnits = syringeType === "0.3ml" ? 30 : syringeType === "0.5ml" ? 50 : 100;

  // Update URL when values change (debounced)
  const updateUrl = useCallback(
    (key: string, value: string | number) => {
      if (!syncUrl) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, syncUrl]
  );

  // Handle variant selection
  const handleVariantChange = (variantId: string | null) => {
    if (!variantId) return;
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariantId(variantId);
      setVialSize(variant.size_mcg);
      setBacWaterMl(variant.common_bac_water_ml);
      updateUrl("vial", variant.size_mcg);
      updateUrl("bac", variant.common_bac_water_ml);
    }
  };

  return (
    <div className="space-y-6">
      {/* Peptide badge */}
      {peptide && !compact && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-heading text-sm">
            {peptide.name}
          </Badge>
          {peptide.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {peptide.category.replace("-", " ")}
            </Badge>
          )}
          {isIU && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
              IU-based
            </Badge>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inputs Card */}
        <Card>
          <CardHeader className={compact ? "pb-3" : undefined}>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Reconstitution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Variant selector (if peptide has variants) */}
            {sortedVariants.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Vial Size
                </Label>
                <Select
                  value={selectedVariantId}
                  onValueChange={handleVariantChange}
                >
                  <SelectTrigger className="touch-target">
                    <SelectValue placeholder="Select vial size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedVariants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.size_label}
                        {isIU ? "" : ` (${v.size_mcg.toLocaleString()} ${unitLabelLower})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom vial size (if no variants or custom entry) */}
            {sortedVariants.length === 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Vial Size ({unitLabel})
                </Label>
                <Input
                  type="number"
                  value={vialSize || ""}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > 0) setVialSize(v);
                  }}
                  placeholder={isIU ? "e.g. 5000" : "e.g. 5000"}
                  className="touch-target"
                />
              </div>
            )}

            {/* BAC Water */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                BAC Water (mL)
              </Label>
              <Select
                value={String(bacWaterMl)}
                onValueChange={(v) => {
                  if (!v) return;
                  setBacWaterMl(Number(v));
                  updateUrl("bac", v);
                }}
              >
                <SelectTrigger className="touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_BAC_WATER_ML.map((ml) => (
                    <SelectItem key={ml} value={String(ml)}>
                      {ml} mL
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.1"
                placeholder="Custom mL"
                className="h-8 text-sm"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > 0) {
                    setBacWaterMl(v);
                    updateUrl("bac", v);
                  }
                }}
              />
            </div>

            {/* Desired Dose */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Desired Dose ({unitLabel})
              </Label>
              <Input
                type="number"
                value={desiredDose || ""}
                onChange={(e) => {
                  setDesiredDose(Number(e.target.value));
                  updateUrl("dose", e.target.value);
                }}
                placeholder={isIU ? "e.g. 500" : "e.g. 250"}
                className="touch-target"
              />
              {peptide?.recommended_dose_mcg_min && peptide?.recommended_dose_mcg_max && (
                <p className="text-xs text-muted-foreground">
                  Typical range: {formatNumber(peptide.recommended_dose_mcg_min)}-
                  {formatNumber(peptide.recommended_dose_mcg_max)} {unitLabelLower}
                </p>
              )}
            </div>

            {/* Syringe Type */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Syringe className="h-3.5 w-3.5" />
                Syringe Size
              </Label>
              <Select
                value={syringeType}
                onValueChange={(v) => {
                  if (!v) return;
                  setSyringeType(v as SyringeType);
                  updateUrl("syringe", v);
                }}
              >
                <SelectTrigger className="touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYRINGE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={`${s.value}ml`}>
                      {s.label}
                      {s.value === 1 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (ticks every 2 units)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost input (optional) */}
            {showCost && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Vial Price (optional)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={vialPrice || ""}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    setVialPrice(v);
                    if (v) updateUrl("price", v);
                  }}
                  placeholder="e.g. 45.00"
                  className="h-8 text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader className={compact ? "pb-3" : undefined}>
            <CardTitle className="text-base">Your Dose</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Syringe Visual */}
              <SyringeVisual
                units={result.syringeUnits}
                maxUnits={syringeMaxUnits}
                height={compact ? 220 : 280}
              />

              {/* Key result - prominent */}
              <div className="text-center">
                <p className="text-3xl font-heading font-bold text-primary">
                  {formatNumber(result.snappedUnits, 1)} units
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Draw to the {formatNumber(result.snappedUnits, 1)} mark on your{" "}
                  {syringeType} syringe
                </p>
              </div>

              {/* Results grid */}
              <div className="w-full space-y-2 rounded-lg bg-muted/50 p-4">
                <ResultRow
                  label="Concentration"
                  value={`${formatNumber(result.concentrationMcgPerMl)} ${unitLabelLower}/mL`}
                />
                <ResultRow
                  label="Injection volume"
                  value={`${formatNumber(result.injectionVolumeMl, 4)} mL`}
                />
                <ResultRow
                  label="Syringe units"
                  value={`${formatNumber(result.syringeUnits, 2)} units`}
                  highlight
                />
                <ResultRow
                  label="Doses per vial"
                  value={`${result.dosesPerVial} doses`}
                />
                {/* Days supply estimate based on frequency */}
                {result.costPerDose !== null && (
                  <>
                    <div className="border-t border-border/50 my-2" />
                    <ResultRow
                      label="Cost per dose"
                      value={`$${result.costPerDose.toFixed(2)}`}
                    />
                    <ResultRow
                      label="Cost per day"
                      value={`$${(result.costPerDose * (peptide?.recommended_frequency?.includes("2x") ? 2 : 1)).toFixed(2)}`}
                    />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transparent math breakdown */}
      <MathBreakdown
        vialSize={vialSize}
        bacWaterMl={bacWaterMl}
        desiredDose={desiredDose}
        concentrationPerMl={result.concentrationMcgPerMl}
        injectionVolumeMl={result.injectionVolumeMl}
        syringeUnits={result.syringeUnits}
        unitLabel={unitLabel}
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          highlight
            ? "font-heading font-bold text-primary text-base"
            : "font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
