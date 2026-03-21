"use client";

import { useState, useMemo } from "react";
import { recommendBacWater } from "@/lib/bac-water";
import { mcgToMg, formatNumber } from "@/lib/calculations";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface BacRecommendationProps {
  peptideMg: number;
  typicalDoseMcg: number;
  bacVialMl: number;
  onSelectBacMl: (ml: number) => void;
}

export function BacRecommendation({
  peptideMg,
  typicalDoseMcg,
  bacVialMl,
  onSelectBacMl,
}: BacRecommendationProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const recommendation = useMemo(
    () => recommendBacWater(peptideMg, typicalDoseMcg, bacVialMl),
    [peptideMg, typicalDoseMcg, bacVialMl]
  );

  const leftoverMl = bacVialMl - recommendation.recommendedMl;

  return (
    <div className="space-y-4">
      {/* Main recommendation */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-2">
        <p className="text-sm text-muted-foreground">We recommend adding</p>
        <p className="text-3xl font-heading font-bold text-primary">
          {recommendation.recommendedMl} mL
        </p>
        <p className="text-sm text-muted-foreground">of BAC water</p>
      </div>

      {/* Reasoning */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {recommendation.reasoning}
      </p>

      {/* Leftover info */}
      {bacVialMl > 0 && leftoverMl > 0 && (
        <p className="text-xs text-muted-foreground">
          You&apos;ll have{" "}
          <span className="font-medium text-foreground">
            {formatNumber(leftoverMl)} mL
          </span>{" "}
          of BAC water left over from your {bacVialMl} mL vial.
        </p>
      )}

      {/* Select recommended button */}
      <button
        type="button"
        onClick={() => onSelectBacMl(recommendation.recommendedMl)}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium transition-colors hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        <Check className="h-4 w-4" />
        Use {recommendation.recommendedMl} mL
      </button>

      {/* Expandable alternatives */}
      <button
        type="button"
        onClick={() => setShowAlternatives(!showAlternatives)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
      >
        {showAlternatives ? (
          <>
            Hide other options <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            See other options <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>

      {showAlternatives && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  BAC Water
                </th>
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  Dose Units
                </th>
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Notes
                </th>
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {recommendation.alternatives.map((alt) => (
                <tr
                  key={alt.bacMl}
                  className={`border-t border-border/50 ${
                    alt.bacMl === recommendation.recommendedMl
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  <td className="px-3 py-2.5 font-medium">
                    {alt.bacMl} mL
                    {alt.bacMl === recommendation.recommendedMl && (
                      <span className="ml-1.5 text-[10px] text-primary font-semibold uppercase">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    ~{Math.round(alt.doseUnits)} units
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                    {alt.pros}
                  </td>
                  <td className="px-3 py-2.5">
                    {alt.bacMl !== recommendation.recommendedMl ? (
                      <button
                        type="button"
                        onClick={() => onSelectBacMl(alt.bacMl)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Select
                      </button>
                    ) : (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
