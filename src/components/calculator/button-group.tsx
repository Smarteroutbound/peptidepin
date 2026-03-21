"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface ButtonGroupOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface ButtonGroupProps {
  label: string;
  options: ButtonGroupOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  customSuffix?: string;
  icon?: React.ReactNode;
}

export function ButtonGroup({
  label,
  options,
  value,
  onChange,
  allowCustom = false,
  customPlaceholder = "Enter custom value",
  customSuffix,
  icon,
}: ButtonGroupProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const isCustomSelected =
    showCustom || (allowCustom && !options.some((o) => o.value === value));

  const layoutId = `button-group-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
      </div>

      {/* Button row */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = !isCustomSelected && option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              className="relative min-h-[44px] min-w-[56px] rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                navigator?.vibrate?.(10);
                setShowCustom(false);
                onChange(option.value);
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {option.icon}
                {option.label}
              </span>
              {!isSelected && (
                <div className="absolute inset-0 rounded-xl bg-muted/50 border border-border" />
              )}
            </button>
          );
        })}

        {/* "Other" button */}
        {allowCustom && (
          <button
            type="button"
            className="relative min-h-[44px] min-w-[56px] rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              navigator?.vibrate?.(10);
              setShowCustom(true);
            }}
          >
            {isCustomSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <span
              className={`relative z-10 ${
                isCustomSelected
                  ? "text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              Other
            </span>
            {!isCustomSelected && (
              <div className="absolute inset-0 rounded-xl bg-muted/50 border border-border" />
            )}
          </button>
        )}
      </div>

      {/* Custom input */}
      {isCustomSelected && allowCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 pt-1"
        >
          <Input
            type="number"
            value={customValue}
            onChange={(e) => {
              const v = e.target.value;
              setCustomValue(v);
              if (v && Number(v) > 0) {
                onChange(Number(v));
              }
            }}
            placeholder={customPlaceholder}
            className="touch-target max-w-[200px]"
            autoFocus
          />
          {customSuffix && (
            <span className="text-sm text-muted-foreground">{customSuffix}</span>
          )}
        </motion.div>
      )}
    </div>
  );
}
