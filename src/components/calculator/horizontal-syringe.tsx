"use client";

import { motion } from "framer-motion";
import { formatNumber } from "@/lib/calculations";

interface HorizontalSyringeProps {
  units: number;
  maxUnits: number;
  syringeType: "0.3ml" | "0.5ml" | "1.0ml";
  unitLabel?: string;
  doseAmount?: number;
}

export function HorizontalSyringe({
  units,
  maxUnits,
  syringeType,
  unitLabel = "mcg",
  doseAmount,
}: HorizontalSyringeProps) {
  const clampedUnits = Math.min(Math.max(units, 0), maxUnits);
  const fillPercent = maxUnits > 0 ? (clampedUnits / maxUnits) * 100 : 0;

  // Determine tick intervals based on syringe size
  const majorInterval = maxUnits <= 30 ? 5 : maxUnits <= 50 ? 10 : 10;
  const minorInterval = maxUnits <= 30 ? 1 : maxUnits <= 50 ? 1 : 2;
  const tickCount = maxUnits / minorInterval;

  // Major label positions
  const majorLabels: number[] = [];
  for (let i = 0; i <= maxUnits; i += majorInterval) {
    majorLabels.push(i);
  }

  return (
    <div className="w-full space-y-3">
      {/* Syringe container */}
      <div className="relative w-full rounded-xl bg-card border border-border overflow-hidden px-4 pt-6 pb-4">
        {/* Major labels row */}
        <div className="relative h-4 mb-1">
          {majorLabels.map((label) => (
            <span
              key={label}
              className="absolute text-[10px] font-mono text-muted-foreground -translate-x-1/2"
              style={{ left: `${(label / maxUnits) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Barrel + tick marks */}
        <div className="relative h-10 rounded-lg bg-muted/40 border border-border/50 overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.35))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />

          {/* Tick marks */}
          <div className="absolute inset-0">
            {Array.from({ length: tickCount + 1 }, (_, i) => {
              const unitValue = i * minorInterval;
              const isMajor = unitValue % majorInterval === 0;
              const pos = (unitValue / maxUnits) * 100;

              return (
                <div
                  key={i}
                  className={`absolute top-0 ${
                    isMajor
                      ? "h-5 w-[1.5px] bg-foreground/40"
                      : "h-3 w-px bg-muted-foreground/30"
                  }`}
                  style={{ left: `${pos}%` }}
                />
              );
            })}
          </div>

          {/* Dose indicator line */}
          {clampedUnits > 0 && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              initial={{ left: "0%" }}
              animate={{ left: `${fillPercent}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            >
              {/* Triangle pointer */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
            </motion.div>
          )}
        </div>

        {/* Syringe label */}
        <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
          <span>{syringeType} syringe</span>
          <span>units (U-100)</span>
        </div>
      </div>

      {/* Draw instruction */}
      <div className="text-center space-y-0.5">
        <p className="text-4xl font-heading font-bold text-primary">
          {formatNumber(clampedUnits, 1)} units
        </p>
        <p className="text-sm text-muted-foreground">
          Draw to the {formatNumber(clampedUnits, 1)} mark on your {syringeType}{" "}
          syringe
          {doseAmount != null && (
            <span>
              {" "}
              to get{" "}
              <span className="font-medium text-foreground">
                {formatNumber(doseAmount)} {unitLabel}
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
