"use client";

import { useState, useMemo } from "react";
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
import { calculateMixing, formatNumber, mcgToMg } from "@/lib/calculations";
import {
  COMMON_VIAL_SIZES_MCG,
  COMMON_BAC_WATER_ML,
  SYRINGE_TYPES,
} from "@/lib/constants";
import { FlaskConical, Droplets, Target, Syringe } from "lucide-react";

interface MixingCalculatorProps {
  /** Pre-fill peptide name */
  peptideName?: string;
  /** Pre-fill vial size in mcg */
  defaultVialSize?: number;
  /** Pre-fill BAC water ml */
  defaultBacWater?: number;
  /** Pre-fill desired dose mcg */
  defaultDose?: number;
  /** Compact mode for embedding */
  compact?: boolean;
}

export function MixingCalculator({
  peptideName,
  defaultVialSize,
  defaultBacWater,
  defaultDose,
  compact = false,
}: MixingCalculatorProps) {
  const [vialSizeMcg, setVialSizeMcg] = useState(defaultVialSize || 5000);
  const [bacWaterMl, setBacWaterMl] = useState(defaultBacWater || 2);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(defaultDose || 250);
  const [syringeMax, setSyringeMax] = useState(100);

  const result = useMemo(
    () => calculateMixing(vialSizeMcg, bacWaterMl, desiredDoseMcg),
    [vialSizeMcg, bacWaterMl, desiredDoseMcg]
  );

  return (
    <div className="space-y-4">
      {peptideName && !compact && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-heading">
            {peptideName}
          </Badge>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader className={compact ? "pb-3" : undefined}>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Reconstitution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vial Size */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Vial Size
              </Label>
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
                      {mcgToMg(size)} mg ({size.toLocaleString()} mcg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">or</span>
                <Input
                  type="number"
                  placeholder="Custom mcg"
                  className="h-8 text-sm"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > 0) setVialSizeMcg(v);
                  }}
                />
              </div>
            </div>

            {/* BAC Water */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                BAC Water (ml)
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
              <Input
                type="number"
                step="0.1"
                placeholder="Custom ml"
                className="h-8 text-sm"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > 0) setBacWaterMl(v);
                }}
              />
            </div>

            {/* Desired Dose */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Desired Dose (mcg)
              </Label>
              <Input
                type="number"
                value={desiredDoseMcg || ""}
                onChange={(e) => setDesiredDoseMcg(Number(e.target.value))}
                placeholder="e.g. 250"
                className="touch-target"
              />
            </div>

            {/* Syringe Type */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Syringe className="h-3.5 w-3.5" />
                Syringe Size
              </Label>
              <Select
                value={String(syringeMax)}
                onValueChange={(v) => setSyringeMax(Number(v))}
              >
                <SelectTrigger className="touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYRINGE_TYPES.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={String(s.value * 100)}
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results + Syringe */}
        <Card>
          <CardHeader className={compact ? "pb-3" : undefined}>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <SyringeVisual
                units={result.syringeUnits}
                maxUnits={syringeMax}
                height={compact ? 220 : 280}
              />

              <div className="w-full space-y-2 rounded-lg bg-muted/50 p-3">
                <ResultRow
                  label="Concentration"
                  value={`${formatNumber(result.concentrationMcgPerMl)} mcg/ml`}
                />
                <ResultRow
                  label="Injection volume"
                  value={`${formatNumber(result.injectionVolumeMl, 3)} ml`}
                />
                <ResultRow
                  label="Syringe units"
                  value={`${formatNumber(result.syringeUnits, 1)} units`}
                  highlight
                />
                <ResultRow
                  label="Doses per vial"
                  value={`${result.dosesPerVial} doses`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
          highlight ? "font-heading font-bold text-primary" : "font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
