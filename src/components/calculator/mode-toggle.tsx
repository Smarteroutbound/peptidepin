"use client";

interface ModeToggleProps {
  mode: "guided" | "quick";
  onModeChange: (mode: "guided" | "quick") => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1 gap-0.5">
      <button
        type="button"
        onClick={() => onModeChange("guided")}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          mode === "guided"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="mr-1" aria-hidden="true">&#x1F9ED;</span>
        Guided
      </button>
      <button
        type="button"
        onClick={() => onModeChange("quick")}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          mode === "quick"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="mr-1" aria-hidden="true">&#x26A1;</span>
        Quick
      </button>
    </div>
  );
}
