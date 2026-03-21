"use client";

import { AnimatePresence, motion } from "framer-motion";

interface WizardStepProps {
  children: React.ReactNode;
  direction: "forward" | "back";
  stepKey: string | number;
}

const variants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

export function WizardStep({ children, direction, stepKey }: WizardStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
