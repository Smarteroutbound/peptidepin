"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "./button-group";
import { HorizontalSyringe } from "./horizontal-syringe";
import { StickyResult } from "./sticky-result";
import { MathBreakdown } from "./math-breakdown";
import {
  calculateMixing,
  formatNumber,
  mcgToMg,
} from "@/lib/calculations";
import {
  COMMON_BAC_WATER_ML,
  COMMON_VIAL_SIZES_MCG,
  SYRINGE_TYPES,
} from "@/lib/constants";
import { FlaskConical, Droplets, Target, Syringe, DollarSign } from "lucide-react";
import type { PeptideWithVariants, PeptideVariant, SyringeType } from "@/types/database";

interface CalculatorV2Props {
  peptide?: PeptideWithVariants;
  defaultVariant?: PeptideVariant;
  showCost?: boolean;
  compact?: boolean;
  syncUrl?: boolean;
}

/**
 * Generate sensible dose options for a peptide based on its recommended range.
 * Falls back to generic dose presets for the generic calculator.
 */
function generateDoseOptions(
  peptide?: PeptideWithVariants
): { label: string; value: number }[] {
  const isIU = peptide?.unit_type === "iu";
  const isGLP1 = peptide?.category === "weight-loss";

  // GLP-1 peptides: show mg values (how users actually think)
  if (isGLP1) {
    return [
      { label: "0.25 mg", value: 250 },
      { label: "0.5 mg", value: 500 },
      { label: "1 mg", value: 1000 },
      { label: "2.5 mg", value: 2500 },
      { label: "5 mg", value: 5000 },
      { label: "7.5 mg", value: 7500 },
      { label: "10 mg", value: 10000 },
      { label: "15 mg", value: 15000 },
    ];
  }

  if (peptide?.recommended_dose_mcg_min && peptide?.recommended_dose_mcg_max) {
    const min = peptide.recommended_dose_mcg_min;
    const max = peptide.recommended_dose_mcg_max;
    const mid = Math.round((min + max) / 2);

    const candidates = new Set<number>();
    candidates.add(min);
    if (mid !== min && mid !== max) candidates.add(mid);
    candidates.add(max);

    if (max / min >= 3) {
      const quarter = Math.round(min + (max - min) * 0.25);
      candidates.add(quarter);
    }

    const sorted = Array.from(candidates).sort((a, b) => a - b);
    return sorted.map((v) => ({
      label: isIU ? `${v.toLocaleString()} IU` : v >= 1000 ? `${mcgToMg(v)} mg` : `${v} mcg`,
      value: v,
    }));
  }

  // Generic fallback doses
  if (isIU) {
    return [
      { label: "250 IU", value: 250 },
      { label: "500 IU", value: 500 },
      { label: "1000 IU", value: 1000 },
      { label: "2000 IU", value: 2000 },
    ];
  }
  return [
    { label: "100 mcg", value: 100 },
    { label: "250 mcg", value: 250 },
    { label: "500 mcg", value: 500 },
    { label: "1 mg", value: 1000 },
    { label: "2 mg", value: 2000 },
  ];
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

  // IU mode
  const isIU = peptide?.unit_type === "iu";
  const unitLabel = isIU ? "IU" : "mcg";

  // URL param helper
  const getDefault = (key: string, fallback: number) => {
    if (syncUrl) {
      const param = searchParams.get(key);
      if (param) return Number(param);
    }
    return fallback;
  };

  // Variants
  const variants = peptide?.variants || [];
  const sortedVariants = [...variants].sort((a, b) => a.sort_order - b.sort_order);
  const selectedDefault =
    defaultVariant || sortedVariants.find((v) => v.is_default) || sortedVariants[0];

  // State
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

  // Intersection observer for sticky result
  const syringeRef = useRef<HTMLDivElement>(null);
  const [syringeInView, setSyringeInView] = useState(true);

  useEffect(() => {
    const el = syringeRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSyringeInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculations
  const result = useMemo(() => {
    const mixing = calculateMixing(vialSize, bacWaterMl, desiredDose);
    const costPerDose =
      vialPrice && mixing.dosesPerVial > 0
        ? vialPrice / mixing.dosesPerVial
        : null;
    const tickInterval = syringeType === "1.0ml" ? 2 : 1;
    const snappedUnits =
      Math.round(mixing.syringeUnits / tickInterval) * tickInterval;

    return { ...mixing, costPerDose, snappedUnits, tickInterval };
  }, [vialSize, bacWaterMl, desiredDose, syringeType, vialPrice]);

  const syringeMaxUnits =
    syringeType === "0.3ml" ? 30 : syringeType === "0.5ml" ? 50 : 100;

  // URL sync
  const updateUrl = useCallback(
    (key: string, value: string | number) => {
      if (!syncUrl) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, syncUrl]
  );

  // Build option arrays
  const vialOptions = sortedVariants.length > 0
    ? sortedVariants.map((v) => ({
        label: v.size_label,
        value: v.size_mcg,
      }))
    : COMMON_VIAL_SIZES_MCG.map((mcg) => ({
        label: mcg >= 1000 ? `${mcgToMg(mcg)} mg` : `${mcg} mcg`,
        value: mcg,
      }));

  const bacWaterOptions = COMMON_BAC_WATER_ML.map((ml) => ({
    label: `${ml} mL`,
    value: ml,
  }));

  const doseOptions = generateDoseOptions(peptide);

  const syringeOptions = SYRINGE_TYPES.map((s) => ({
    label: `${s.label.split(" ")[0]}`,
    value: `${s.value}ml`,
  }));

  // Handle variant-aware vial change
  const handleVialChange = (val: string | number) => {
    const numVal = Number(val);
    setVialSize(numVal);
    updateUrl("vial", numVal);
    // If it's a variant, also update BAC water
    const variant = sortedVariants.find((v) => v.size_mcg === numVal);
    if (variant) {
      setBacWaterMl(variant.common_bac_water_ml);
      updateUrl("bac", variant.common_bac_water_ml);
    }
  };

  // Math details open state
  const [mathOpen, setMathOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Peptide badges */}
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
            <Badge
              variant="outline"
              className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20"
            >
              IU-based
            </Badge>
          )}
        </div>
      )}

      {/* STEP 1: VIAL SIZE */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            1
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Vial
          </span>
        </div>
        <ButtonGroup
          label="Vial Size"
          icon={<FlaskConical className="h-3.5 w-3.5" />}
          options={vialOptions}
          value={vialSize}
          onChange={handleVialChange}
          allowCustom={sortedVariants.length === 0}
          customPlaceholder={isIU ? "e.g. 5000" : "e.g. 5000"}
          customSuffix={unitLabel}
        />
      </section>

      <div className="border-t border-border/50" />

      {/* STEP 2: RECONSTITUTION */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            2
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Reconstitution
          </span>
        </div>
        <ButtonGroup
          label="BAC Water"
          icon={<Droplets className="h-3.5 w-3.5" />}
          options={bacWaterOptions}
          value={bacWaterMl}
          onChange={(v) => {
            const num = Number(v);
            setBacWaterMl(num);
            updateUrl("bac", num);
          }}
          allowCustom
          customPlaceholder="Custom mL"
          customSuffix="mL"
        />
      </section>

      <div className="border-t border-border/50" />

      {/* STEP 3: YOUR DOSE */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            3
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Dose
          </span>
        </div>
        <ButtonGroup
          label={peptide?.category === "weight-loss" ? "Desired Dose (mg)" : `Desired Dose (${unitLabel})`}
          icon={<Target className="h-3.5 w-3.5" />}
          options={doseOptions}
          value={desiredDose}
          onChange={(v) => {
            const num = Number(v);
            setDesiredDose(num);
            updateUrl("dose", num);
          }}
          allowCustom
          customPlaceholder={peptide?.category === "weight-loss" ? "e.g. 0.5" : isIU ? "e.g. 500" : "e.g. 250"}
          customSuffix={peptide?.category === "weight-loss" ? "mg" : unitLabel}
        />
        {peptide?.recommended_dose_mcg_min && peptide?.recommended_dose_mcg_max && (
          <p className="text-xs text-muted-foreground mt-1">
            Typical range:{" "}
            {peptide.category === "weight-loss"
              ? `${mcgToMg(peptide.recommended_dose_mcg_min)}–${mcgToMg(peptide.recommended_dose_mcg_max)} mg`
              : `${formatNumber(peptide.recommended_dose_mcg_min)}–${formatNumber(peptide.recommended_dose_mcg_max)} ${unitLabel}`}
          </p>
        )}
      </section>

      <div className="border-t border-border/50" />

      {/* STEP 4: SYRINGE */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            4
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Syringe
          </span>
        </div>
        <ButtonGroup
          label="Syringe Size"
          icon={<Syringe className="h-3.5 w-3.5" />}
          options={syringeOptions}
          value={syringeType}
          onChange={(v) => {
            const val = v as SyringeType;
            setSyringeType(val);
            updateUrl("syringe", val);
          }}
        />
      </section>

      <div className="border-t border-border/50" />

      {/* RESULT */}
      <section ref={syringeRef} className="space-y-6">
        <HorizontalSyringe
          units={result.syringeUnits}
          maxUnits={syringeMaxUnits}
          syringeType={syringeType}
          unitLabel={unitLabel}
          doseAmount={desiredDose}
        />

        {/* Precision warning */}
        {result.tickInterval === 2 && result.syringeUnits % 2 !== 0 && (
          <p className="text-xs text-amber-500 text-center">
            On a 1.0mL syringe, tick marks are every 2 units.{" "}
            {formatNumber(result.syringeUnits, 1)} is between the{" "}
            {Math.floor(result.syringeUnits / 2) * 2} and{" "}
            {Math.ceil(result.syringeUnits / 2) * 2} marks. Consider a 0.5mL or
            0.3mL syringe for more precision.
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <StatCard
            label="Concentration"
            value={`${formatNumber(result.concentrationMcgPerMl)} ${unitLabel}/mL`}
          />
          <StatCard
            label="Volume"
            value={`${formatNumber(result.injectionVolumeMl, 4)} mL`}
          />
          <StatCard
            label="Doses/Vial"
            value={`${result.dosesPerVial}`}
          />
        </div>

        {/* Cost section */}
        {showCost && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Vial Price (optional)
              </span>
            </div>
            <Input
              type="number"
              step="0.01"
              value={vialPrice ?? ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setVialPrice(v);
                if (v) updateUrl("price", v);
              }}
              placeholder="e.g. 45.00"
              className="h-10 max-w-[200px]"
            />
            {result.costPerDose !== null && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Cost/Dose"
                  value={`$${result.costPerDose.toFixed(2)}`}
                />
                <StatCard
                  label="Cost/Day"
                  value={`$${(
                    result.costPerDose *
                    (peptide?.recommended_frequency?.includes("2x") ? 2 : 1)
                  ).toFixed(2)}`}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Collapsible math breakdown */}
      <details
        open={mathOpen}
        onToggle={(e) => setMathOpen((e.target as HTMLDetailsElement).open)}
        className="group"
      >
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <svg
            className="h-4 w-4 transition-transform group-open:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Show calculation
        </summary>
        <div className="pt-2">
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
      </details>

      {/* Sticky bottom result */}
      <StickyResult
        units={result.syringeUnits}
        dose={desiredDose}
        volumeMl={result.injectionVolumeMl}
        unitLabel={unitLabel}
        visible={!syringeInView}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 border border-border/50 px-2 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm font-heading font-semibold text-foreground truncate">
        {value}
      </p>
    </div>
  );
}
