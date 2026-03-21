"use client";

import { useState } from "react";
import { getPeptideKnowledge } from "@/lib/peptide-knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  Snowflake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PeptideInfoCardProps {
  slug: string;
  compact?: boolean;
}

type TabId = "overview" | "sideEffects" | "tips" | "storage";

export function PeptideInfoCard({ slug, compact = false }: PeptideInfoCardProps) {
  const knowledge = getPeptideKnowledge(slug);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (!knowledge) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Info className="h-3.5 w-3.5" /> },
    {
      id: "sideEffects",
      label: "Side Effects",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    { id: "tips", label: "Tips", icon: <Lightbulb className="h-3.5 w-3.5" /> },
    {
      id: "storage",
      label: "Storage",
      icon: <Snowflake className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            About this peptide
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="text-sm space-y-3">
            {activeTab === "overview" && (
              <>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    What is it?
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {knowledge.whatIsIt}
                  </p>
                </div>
                {!compact && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      How it works
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {knowledge.howItWorks}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Common uses
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-sm text-foreground">
                    {knowledge.commonUses.map((use) => (
                      <li key={use}>{use}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === "sideEffects" && (
              <div>
                <ul className="space-y-1.5">
                  {knowledge.sideEffects.map((effect) => (
                    <li
                      key={effect}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "tips" && (
              <>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    When to inject
                  </h4>
                  <p className="text-sm text-foreground">{knowledge.whenToInject}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Fasted or fed?
                  </h4>
                  <p className="text-sm text-foreground">{knowledge.fastedOrFed}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Injection sites
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-sm text-foreground">
                    {knowledge.injectionSites.map((site) => (
                      <li key={site}>{site}</li>
                    ))}
                  </ul>
                </div>
                {knowledge.importantNotes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Important notes
                    </h4>
                    <ul className="space-y-1.5">
                      {knowledge.importantNotes.map((note) => (
                        <li
                          key={note}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === "storage" && (
              <>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Before reconstitution
                  </h4>
                  <p className="text-sm text-foreground">
                    {knowledge.storageBefore}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    After reconstitution
                  </h4>
                  <p className="text-sm text-foreground">
                    {knowledge.storageAfter}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Week-by-week if available */}
          {knowledge.weekByWeek && activeTab === "overview" && !compact && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Titration schedule
              </h4>
              <div className="space-y-1.5">
                {knowledge.weekByWeek.map((week, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    {week}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
