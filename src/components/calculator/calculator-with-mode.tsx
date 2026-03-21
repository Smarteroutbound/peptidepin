"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "./mode-toggle";
import { GuidedWizard } from "./guided-wizard";
import { CalculatorV2 } from "./calculator-v2";
import type { PeptideWithVariants, PeptideVariant } from "@/types/database";

interface CalculatorWithModeProps {
  peptide?: PeptideWithVariants;
  defaultVariant?: PeptideVariant;
  allPeptides?: { name: string; slug: string; category: string; description: string }[];
  showCost?: boolean;
}

export function CalculatorWithMode({
  peptide,
  defaultVariant,
  allPeptides,
  showCost = true,
}: CalculatorWithModeProps) {
  // Default to guided mode, persist preference
  const [mode, setMode] = useState<"guided" | "quick">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("peptidepin-calc-mode");
      if (saved === "quick") return "quick";
    }
    return "guided";
  });

  useEffect(() => {
    localStorage.setItem("peptidepin-calc-mode", mode);
  }, [mode]);

  return (
    <div className="space-y-6">
      <ModeToggle mode={mode} onModeChange={setMode} />

      {mode === "guided" ? (
        <GuidedWizard peptide={peptide} allPeptides={allPeptides} />
      ) : (
        <CalculatorV2
          peptide={peptide}
          defaultVariant={defaultVariant}
          showCost={showCost}
          syncUrl={true}
        />
      )}
    </div>
  );
}
