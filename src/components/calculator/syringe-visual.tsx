"use client";

import { motion } from "framer-motion";

interface SyringeVisualProps {
  /** Syringe units to display (0-100 for U-100, 0-50 for 0.5ml, 0-30 for 0.3ml) */
  units: number;
  /** Max units on this syringe type */
  maxUnits?: number;
  /** Height of the syringe in px */
  height?: number;
}

export function SyringeVisual({
  units,
  maxUnits = 100,
  height = 280,
}: SyringeVisualProps) {
  const clampedUnits = Math.min(Math.max(units, 0), maxUnits);
  const fillPercent = (clampedUnits / maxUnits) * 100;

  // Syringe dimensions
  const width = 60;
  const barrelTop = 40;
  const barrelHeight = height - 80;
  const barrelBottom = barrelTop + barrelHeight;
  const barrelWidth = 36;
  const barrelX = (width - barrelWidth) / 2;

  // Graduation marks
  const majorMarks = maxUnits <= 30 ? 5 : maxUnits <= 50 ? 5 : 10;
  const minorMarks = maxUnits <= 30 ? 1 : maxUnits <= 50 ? 1 : 2;
  const markCount = maxUnits / minorMarks;

  // Fill level (bottom-up)
  const fillHeight = (fillPercent / 100) * barrelHeight;
  const fillY = barrelBottom - fillHeight;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={width + 40}
        height={height}
        viewBox={`-20 0 ${width + 40} ${height}`}
        className="drop-shadow-md"
      >
        {/* Barrel outline */}
        <rect
          x={barrelX}
          y={barrelTop}
          width={barrelWidth}
          height={barrelHeight}
          rx={2}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="text-muted-foreground/50"
        />

        {/* Fill liquid */}
        <motion.rect
          x={barrelX + 1}
          width={barrelWidth - 2}
          rx={1}
          className="fill-primary/70"
          initial={{ y: barrelBottom, height: 0 }}
          animate={{
            y: fillY,
            height: fillHeight,
          }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />

        {/* Fill line indicator */}
        {clampedUnits > 0 && (
          <motion.line
            x1={barrelX - 3}
            x2={barrelX + barrelWidth + 3}
            className="stroke-primary"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ y1: barrelBottom, y2: barrelBottom }}
            animate={{ y1: fillY, y2: fillY }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />
        )}

        {/* Graduation marks */}
        {Array.from({ length: markCount + 1 }, (_, i) => {
          const unitValue = i * minorMarks;
          const isMajor = unitValue % majorMarks === 0;
          const y = barrelBottom - (unitValue / maxUnits) * barrelHeight;
          const markLen = isMajor ? 8 : 4;

          return (
            <g key={i}>
              <line
                x1={barrelX - markLen}
                y1={y}
                x2={barrelX}
                y2={y}
                stroke="currentColor"
                strokeWidth={isMajor ? 1.2 : 0.6}
                className="text-muted-foreground/60"
              />
              {isMajor && unitValue > 0 && (
                <text
                  x={barrelX - markLen - 3}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px]"
                >
                  {unitValue}
                </text>
              )}
            </g>
          );
        })}

        {/* Plunger top */}
        <rect
          x={barrelX + 6}
          y={4}
          width={barrelWidth - 12}
          height={8}
          rx={2}
          fill="currentColor"
          className="text-muted-foreground/40"
        />
        {/* Plunger rod */}
        <rect
          x={barrelX + 14}
          y={12}
          width={barrelWidth - 28}
          height={barrelTop - 12}
          fill="currentColor"
          className="text-muted-foreground/30"
        />

        {/* Needle hub */}
        <rect
          x={barrelX + 10}
          y={barrelBottom}
          width={barrelWidth - 20}
          height={12}
          rx={1}
          fill="currentColor"
          className="text-muted-foreground/40"
        />
        {/* Needle */}
        <line
          x1={width / 2}
          y1={barrelBottom + 12}
          x2={width / 2}
          y2={height}
          stroke="currentColor"
          strokeWidth={1}
          className="text-muted-foreground/50"
        />

        {/* Units label */}
        {clampedUnits > 0 && (
          <motion.text
            x={barrelX + barrelWidth + 8}
            textAnchor="start"
            className="fill-primary font-heading text-[11px] font-bold"
            initial={{ y: barrelBottom }}
            animate={{ y: fillY + 4 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            {clampedUnits.toFixed(1)} u
          </motion.text>
        )}
      </svg>
      <span className="text-xs text-muted-foreground">
        {maxUnits === 30
          ? "0.3ml syringe"
          : maxUnits === 50
          ? "0.5ml syringe"
          : "1ml syringe"}
      </span>
    </div>
  );
}
