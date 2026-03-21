"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/calculations";
import { Calculator } from "lucide-react";

interface MathBreakdownProps {
  vialSize: number;
  bacWaterMl: number;
  desiredDose: number;
  concentrationPerMl: number;
  injectionVolumeMl: number;
  syringeUnits: number;
  unitLabel: string; // "mcg", "mg", or "IU"
}

export function MathBreakdown({
  vialSize,
  bacWaterMl,
  desiredDose,
  concentrationPerMl,
  injectionVolumeMl,
  syringeUnits,
  unitLabel,
}: MathBreakdownProps) {
  const isIU = unitLabel === "IU";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          How We Calculated This
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Step 1: Concentration */}
          <MathStep
            step={1}
            title="Calculate concentration"
            formula={
              isIU
                ? `${formatNumber(vialSize)} IU ÷ ${formatNumber(bacWaterMl)} mL`
                : `${formatNumber(vialSize)} ${unitLabel} ÷ ${formatNumber(bacWaterMl)} mL`
            }
            result={`${formatNumber(concentrationPerMl)} ${unitLabel}/mL`}
            explanation={
              isIU
                ? `Your ${formatNumber(vialSize)} IU vial mixed with ${formatNumber(bacWaterMl)} mL of BAC water gives a concentration of ${formatNumber(concentrationPerMl)} IU per mL.`
                : `Your ${formatNumber(vialSize)} ${unitLabel} vial mixed with ${formatNumber(bacWaterMl)} mL of BAC water gives a concentration of ${formatNumber(concentrationPerMl)} ${unitLabel} per mL.`
            }
          />

          {/* Step 2: Injection volume */}
          <MathStep
            step={2}
            title="Calculate injection volume"
            formula={`${formatNumber(desiredDose)} ${unitLabel} ÷ ${formatNumber(concentrationPerMl)} ${unitLabel}/mL`}
            result={`${formatNumber(injectionVolumeMl, 4)} mL`}
            explanation={`To get your desired dose of ${formatNumber(desiredDose)} ${unitLabel}, you need to draw ${formatNumber(injectionVolumeMl, 4)} mL from the vial.`}
          />

          {/* Step 3: Convert to syringe units */}
          <MathStep
            step={3}
            title="Convert to syringe units"
            formula={`${formatNumber(injectionVolumeMl, 4)} mL × 100`}
            result={`${formatNumber(syringeUnits, 2)} units`}
            explanation={`On a U-100 insulin syringe, 1 mL = 100 units. So ${formatNumber(injectionVolumeMl, 4)} mL = ${formatNumber(syringeUnits, 2)} units. Draw to the ${formatNumber(Math.round(syringeUnits), 0)} mark on your syringe.`}
            highlight
          />
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary font-heading font-bold">
              Draw to {formatNumber(Math.round(syringeUnits), 0)} units
            </span>{" "}
            on your insulin syringe to inject{" "}
            <span className="font-semibold">
              {formatNumber(desiredDose)} {unitLabel}
            </span>{" "}
            of your peptide.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MathStep({
  step,
  title,
  formula,
  result,
  explanation,
  highlight = false,
}: {
  step: number;
  title: string;
  formula: string;
  result: string;
  explanation: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Step number */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          highlight
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {step}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">{title}</p>

        {/* Formula display */}
        <div className="rounded-md bg-muted/70 px-3 py-2 font-mono text-sm mb-2">
          <span className="text-muted-foreground">{formula}</span>
          <span className="text-muted-foreground mx-2">=</span>
          <span className={highlight ? "text-primary font-bold" : "font-semibold text-foreground"}>
            {result}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{explanation}</p>
      </div>
    </div>
  );
}
