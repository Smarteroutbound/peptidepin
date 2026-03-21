"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatNumber } from "@/lib/calculations";

interface StickyResultProps {
  units: number;
  dose: number;
  volumeMl: number;
  unitLabel: string;
  visible: boolean;
}

export function StickyResult({
  units,
  dose,
  volumeMl,
  unitLabel,
  visible,
}: StickyResultProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl safe-bottom"
        >
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span className="text-lg">💉</span>
              <span className="text-primary font-heading font-bold">
                Draw {formatNumber(units, 1)} units
              </span>
              <span className="text-muted-foreground">&#8226;</span>
              <span>
                {formatNumber(dose)} {unitLabel}
              </span>
              <span className="text-muted-foreground">&#8226;</span>
              <span className="text-muted-foreground">
                {formatNumber(volumeMl, 4)} mL
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
