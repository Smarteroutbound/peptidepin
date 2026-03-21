"use client";

import { useState, useMemo, useCallback } from "react";
import { ButtonGroup } from "./button-group";
import { HorizontalSyringe } from "./horizontal-syringe";
import { MathBreakdown } from "./math-breakdown";
import { BacRecommendation } from "./bac-recommendation";
import { PeptideInfoCard } from "./peptide-info-card";
import { WizardStep } from "./wizard-step";
import {
  calculateMixing,
  formatNumber,
  mcgToMg,
  suggestSyringeSize,
} from "@/lib/calculations";
import { SYRINGE_TYPES } from "@/lib/constants";
import {
  FlaskConical,
  Droplets,
  Target,
  Syringe,
  ArrowLeft,
  ArrowRight,
  Search,
} from "lucide-react";
import type {
  PeptideWithVariants,
  SyringeType,
} from "@/types/database";

// ---------- types ----------

interface GuidedWizardProps {
  peptide?: PeptideWithVariants;
  allPeptides?: {
    name: string;
    slug: string;
    category: string;
    description: string;
  }[];
}

// ---------- helpers ----------

/** Check whether a peptide belongs to the weight-loss / GLP-1 family */
function isWeightLoss(
  peptide?: PeptideWithVariants | { category: string } | null
): boolean {
  if (!peptide) return false;
  return (peptide as { category?: string }).category === "weight-loss";
}

/** Generate mg-denominated dose buttons for GLP-1 peptides */
function glp1DoseOptions(): { label: string; value: number }[] {
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

/** Generate generic dose buttons (mcg) */
function genericDoseOptions(
  peptide?: PeptideWithVariants
): { label: string; value: number }[] {
  const isIU = peptide?.unit_type === "iu";

  if (
    peptide?.recommended_dose_mcg_min &&
    peptide?.recommended_dose_mcg_max
  ) {
    const min = peptide.recommended_dose_mcg_min;
    const max = peptide.recommended_dose_mcg_max;
    const mid = Math.round((min + max) / 2);
    const candidates = new Set<number>();
    candidates.add(min);
    if (mid !== min && mid !== max) candidates.add(mid);
    candidates.add(max);
    if (max / min >= 3) candidates.add(Math.round(min + (max - min) * 0.25));
    const sorted = Array.from(candidates).sort((a, b) => a - b);
    return sorted.map((v) => ({
      label: isIU
        ? `${v.toLocaleString()} IU`
        : v >= 1000
          ? `${mcgToMg(v)} mg`
          : `${v} mcg`,
      value: v,
    }));
  }

  if (isIU) {
    return [
      { label: "250 IU", value: 250 },
      { label: "500 IU", value: 500 },
      { label: "1,000 IU", value: 1000 },
      { label: "2,000 IU", value: 2000 },
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

// ---------- constants ----------

const TOTAL_STEPS = 6;

const SYRINGE_OPTIONS: {
  label: string;
  value: SyringeType;
  description: string;
}[] = [
  {
    label: "0.3 mL",
    value: "0.3ml",
    description: "30 units — most precise. Each line = 1 unit. Best for small doses under 30 units.",
  },
  {
    label: "0.5 mL",
    value: "0.5ml",
    description: "50 units — good all-around. Each line = 1 unit. Great for medium doses.",
  },
  {
    label: "1.0 mL",
    value: "1.0ml",
    description: "100 units — the standard insulin syringe most people have. ⚠️ Each line = 2 units, not 1!",
  },
];

// ---------- component ----------

export function GuidedWizard({ peptide, allPeptides }: GuidedWizardProps) {
  // If peptide is provided, skip step 1
  const startStep = peptide ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(startStep);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Step 1: peptide selection (only used if no peptide prop)
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2: vial size
  const variants = peptide?.variants || [];
  const sortedVariants = [...variants].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const defaultVariant =
    sortedVariants.find((v) => v.is_default) || sortedVariants[0];
  const [selectedVialMcg, setSelectedVialMcg] = useState(
    defaultVariant?.size_mcg || peptide?.typical_vial_size_mcg || 5000
  );

  // Step 3: BAC water
  const defaultBac =
    defaultVariant?.common_bac_water_ml || peptide?.common_bac_water_ml || 2;
  const [bacVialMl] = useState(30); // typical BAC vial is 30mL
  const [selectedBacMl, setSelectedBacMl] = useState(defaultBac);

  // Step 4: desired dose
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(
    peptide?.recommended_dose_mcg_min || 250
  );

  // Step 5: syringe
  const [syringeType, setSyringeType] = useState<SyringeType>("0.5ml");

  // Unit label
  const isIU = peptide?.unit_type === "iu";
  const unitLabel = isIU ? "IU" : "mcg";

  // Computed result
  const result = useMemo(
    () => calculateMixing(selectedVialMcg, selectedBacMl, desiredDoseMcg),
    [selectedVialMcg, selectedBacMl, desiredDoseMcg]
  );

  const syringeMaxUnits =
    syringeType === "0.3ml" ? 30 : syringeType === "0.5ml" ? 50 : 100;

  // Navigation
  const goForward = useCallback(() => {
    setDirection("forward");
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection("back");
    setCurrentStep((s) => Math.max(s - 1, startStep));
  }, [startStep]);

  // Auto-advance handler for single-choice steps
  const handleVialSelect = useCallback(
    (val: string | number) => {
      const num = Number(val);
      setSelectedVialMcg(num);
      // Update BAC if variant provides one
      const variant = sortedVariants.find((v) => v.size_mcg === num);
      if (variant) {
        setSelectedBacMl(variant.common_bac_water_ml);
      }
      // Auto-advance after brief delay
      setTimeout(goForward, 250);
    },
    [sortedVariants, goForward]
  );

  const handleSyringeSelect = useCallback(
    (val: string | number) => {
      setSyringeType(val as SyringeType);
      setTimeout(goForward, 250);
    },
    [goForward]
  );

  // Vial options
  const vialOptions =
    sortedVariants.length > 0
      ? sortedVariants.map((v) => ({ label: v.size_label, value: v.size_mcg }))
      : [
          { label: "2 mg", value: 2000 },
          { label: "5 mg", value: 5000 },
          { label: "10 mg", value: 10000 },
          { label: "15 mg", value: 15000 },
          { label: "30 mg", value: 30000 },
        ];

  // Dose options
  const doseOptions = isWeightLoss(peptide)
    ? glp1DoseOptions()
    : genericDoseOptions(peptide);

  // Syringe button options
  const syringeButtonOptions = SYRINGE_OPTIONS.map((s) => ({
    label: s.label,
    value: s.value as string,
  }));

  // Suggested syringe
  const suggestedSyringe = suggestSyringeSize(result.injectionVolumeMl);

  // Filtered peptide list for step 1
  const filteredPeptides = useMemo(() => {
    if (!allPeptides) return [];
    if (!searchQuery.trim()) return allPeptides;
    const q = searchQuery.toLowerCase();
    return allPeptides.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [allPeptides, searchQuery]);

  // Progress dots
  const totalDots = peptide ? 5 : 6;
  const currentDot = peptide ? currentStep - 1 : currentStep;

  // Math breakdown state
  const [mathOpen, setMathOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalDots }, (_, i) => {
          const dotStep = peptide ? i + 2 : i + 1;
          const isActive = dotStep === currentStep;
          const isCompleted = dotStep < currentStep;
          return (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-6 bg-primary"
                  : isCompleted
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
              }`}
            />
          );
        })}
      </div>

      {/* Step content */}
      <WizardStep direction={direction} stepKey={currentStep}>
        {/* STEP 1: Peptide Selection */}
        {currentStep === 1 && !peptide && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                Which peptide are you using?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select your peptide to get personalized guidance
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peptides..."
                className="w-full rounded-xl border border-border bg-background px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filteredPeptides.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => {
                    // In the generic wizard without a peptide prop,
                    // we just advance. The parent page handles navigation.
                    goForward();
                  }}
                  className="w-full text-left rounded-xl border border-border bg-card p-3.5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {p.category.replace("-", " ")}
                    {p.description && ` - ${p.description}`}
                  </p>
                </button>
              ))}
              {filteredPeptides.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No peptides found. Try a different search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Vial Size */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                What vial size do you have?
              </h2>
              <p className="text-sm text-muted-foreground">
                Check the label on your peptide vial
              </p>
            </div>

            <ButtonGroup
              label="Vial Size"
              icon={<FlaskConical className="h-3.5 w-3.5" />}
              options={vialOptions}
              value={selectedVialMcg}
              onChange={handleVialSelect}
              allowCustom={sortedVariants.length === 0}
              customPlaceholder={isIU ? "e.g. 5000" : "e.g. 5000"}
              customSuffix={unitLabel}
            />
          </div>
        )}

        {/* STEP 3: BAC Water */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                How much BAC water to add?
              </h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll recommend the best amount for your peptide
              </p>
            </div>

            <BacRecommendation
              peptideMg={selectedVialMcg / 1000}
              typicalDoseMcg={desiredDoseMcg}
              bacVialMl={bacVialMl}
              onSelectBacMl={(ml) => {
                setSelectedBacMl(ml);
                goForward();
              }}
            />
          </div>
        )}

        {/* STEP 4: Desired Dose */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                What dose do you want to inject?
              </h2>
              <p className="text-sm text-muted-foreground">
                {isWeightLoss(peptide)
                  ? "Select your prescribed dose in mg"
                  : `Choose your desired dose in ${unitLabel}`}
              </p>
            </div>

            <ButtonGroup
              label={
                isWeightLoss(peptide)
                  ? "Dose (mg)"
                  : `Desired Dose (${unitLabel})`
              }
              icon={<Target className="h-3.5 w-3.5" />}
              options={doseOptions}
              value={desiredDoseMcg}
              onChange={(v) => setDesiredDoseMcg(Number(v))}
              allowCustom
              customPlaceholder={
                isWeightLoss(peptide)
                  ? "e.g. 1.5"
                  : isIU
                    ? "e.g. 500"
                    : "e.g. 250"
              }
              customSuffix={isWeightLoss(peptide) ? "mg" : unitLabel}
            />

            {peptide?.recommended_dose_mcg_min &&
              peptide?.recommended_dose_mcg_max && (
                <p className="text-xs text-muted-foreground text-center">
                  Typical range:{" "}
                  {isWeightLoss(peptide)
                    ? `${mcgToMg(peptide.recommended_dose_mcg_min)}–${mcgToMg(peptide.recommended_dose_mcg_max)} mg`
                    : `${formatNumber(peptide.recommended_dose_mcg_min)}–${formatNumber(peptide.recommended_dose_mcg_max)} ${unitLabel}`}
                </p>
              )}
          </div>
        )}

        {/* STEP 5: Syringe */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                Which insulin syringe do you have?
              </h2>
              <p className="text-sm text-muted-foreground">
                We recommend a{" "}
                <span className="font-medium text-primary">
                  {suggestedSyringe}
                </span>{" "}
                syringe for your dose
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 border border-border/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                <strong>Not sure?</strong> Look at the numbers on your syringe.
                If it goes up to <strong>100</strong>, you have a 1.0 mL syringe (most common).
                Up to <strong>50</strong>? That&apos;s 0.5 mL. Up to <strong>30</strong>? That&apos;s 0.3 mL.
              </p>
            </div>

            <div className="space-y-2">
              {SYRINGE_OPTIONS.map((opt) => {
                const isSelected = syringeType === opt.value;
                const isRecommended = opt.value === suggestedSyringe;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSyringeSelect(opt.value)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {opt.label} syringe
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                      {isRecommended && (
                        <span className="text-[10px] font-semibold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                          Best fit
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Result */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-heading font-semibold">
                Your dosing result
              </h2>
              <p className="text-sm text-muted-foreground">
                Draw to this mark on your syringe
              </p>
            </div>

            {/* Syringe visual */}
            <HorizontalSyringe
              units={result.syringeUnits}
              maxUnits={syringeMaxUnits}
              syringeType={syringeType}
              unitLabel={unitLabel}
              doseAmount={desiredDoseMcg}
            />

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

            {/* Summary card */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
              <p className="text-sm">
                Mix{" "}
                <span className="font-semibold">
                  {formatNumber(selectedBacMl)} mL
                </span>{" "}
                BAC water into your{" "}
                <span className="font-semibold">
                  {formatNumber(selectedVialMcg >= 1000 ? mcgToMg(selectedVialMcg) : selectedVialMcg)}{" "}
                  {selectedVialMcg >= 1000 ? "mg" : unitLabel}
                </span>{" "}
                vial.
              </p>
              <p className="text-sm">
                Draw to{" "}
                <span className="font-heading font-bold text-primary">
                  {formatNumber(result.syringeUnits, 1)} units
                </span>{" "}
                on your {syringeType} syringe to inject{" "}
                <span className="font-semibold">
                  {isWeightLoss(peptide)
                    ? `${formatNumber(mcgToMg(desiredDoseMcg))} mg`
                    : `${formatNumber(desiredDoseMcg)} ${unitLabel}`}
                </span>
                .
              </p>
              <p className="text-xs text-muted-foreground">
                This vial has {result.dosesPerVial} doses at this amount.
              </p>
            </div>

            {/* Math breakdown */}
            <details
              open={mathOpen}
              onToggle={(e) =>
                setMathOpen((e.target as HTMLDetailsElement).open)
              }
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Show calculation
              </summary>
              <div className="pt-2">
                <MathBreakdown
                  vialSize={selectedVialMcg}
                  bacWaterMl={selectedBacMl}
                  desiredDose={desiredDoseMcg}
                  concentrationPerMl={result.concentrationMcgPerMl}
                  injectionVolumeMl={result.injectionVolumeMl}
                  syringeUnits={result.syringeUnits}
                  unitLabel={unitLabel}
                />
              </div>
            </details>

            {/* Peptide info card */}
            {peptide && <PeptideInfoCard slug={peptide.slug} />}
          </div>
        )}
      </WizardStep>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > startStep ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Show Next only on steps that don't auto-advance */}
        {currentStep === 4 && (
          <button
            type="button"
            onClick={goForward}
            className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Step 6 has no Next */}
        {currentStep === 6 && (
          <button
            type="button"
            onClick={() => {
              setCurrentStep(startStep);
              setDirection("back");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
          >
            Start over
          </button>
        )}
      </div>
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
