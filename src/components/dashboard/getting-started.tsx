"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  FlaskConical,
  CalendarClock,
  Bell,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

interface GettingStartedProps {
  hasVials: boolean;
  hasSchedules: boolean;
  hasLoggedDose: boolean;
}

interface Step {
  number: number;
  done: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
  ctaLabel: string;
  ctaHref?: string;
  ctaAction?: () => void;
}

/**
 * Onboarding checklist shown on empty dashboards.
 * Walks users through: calculate → add vial → schedule → enable notifications.
 */
export function GettingStarted({ hasVials, hasSchedules, hasLoggedDose }: GettingStartedProps) {
  const [notifGranted, setNotifGranted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifGranted(result === "granted");
  }

  const steps: Step[] = [
    {
      number: 1,
      done: hasVials, // Calculating counts as done once they've added a vial
      icon: <Calculator className="h-4 w-4" />,
      title: "Calculate your dose",
      description: "Use the free calculator to figure out exact syringe units for your peptide.",
      tip: "💡 Enter your vial size, BAC water amount, and desired dose. The syringe visual shows exactly where to draw.",
      ctaLabel: "Open Calculator",
      ctaHref: "/calculator",
    },
    {
      number: 2,
      done: hasVials,
      icon: <FlaskConical className="h-4 w-4" />,
      title: "Add your vial",
      description: "Save your reconstituted vial so the app tracks remaining doses and expiry.",
      tip: "💡 Vials last 28 days after reconstitution. We'll warn you before it expires.",
      ctaLabel: "Add Vial",
      ctaHref: "/my-peptides/new",
    },
    {
      number: 3,
      done: hasSchedules,
      icon: <CalendarClock className="h-4 w-4" />,
      title: "Create a schedule",
      description: "Set when to inject. The app reminds you and tracks adherence.",
      tip: "💡 GLP-1s (semaglutide, tirzepatide, retatrutide) are usually weekly. BPC-157 is often 1-2x daily.",
      ctaLabel: "Create Schedule",
      ctaHref: "/schedule/new",
    },
    {
      number: 4,
      done: notifGranted,
      icon: <Bell className="h-4 w-4" />,
      title: "Enable reminders",
      description: "Never miss a dose. Browser notifications fire at your scheduled times.",
      tip: "💡 For the best experience on mobile, install PeptidePin to your home screen.",
      ctaLabel: notifGranted ? "Enabled" : "Enable",
      ctaAction: enableNotifications,
    },
  ];

  // Find the current step (first one not done)
  const currentStepIndex = steps.findIndex((s) => !s.done);
  const allDone = currentStepIndex === -1;

  if (allDone && hasLoggedDose) return null;

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-heading font-semibold">Getting Started</h2>
            <span className="text-xs text-muted-foreground">{completedCount}/{steps.length}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => {
            const isCurrent = i === currentStepIndex;
            const isDone = step.done;

            return (
              <div
                key={step.number}
                className={`rounded-lg border p-3 transition-colors ${
                  isCurrent
                    ? "border-primary/40 bg-primary/5"
                    : isDone
                    ? "border-border bg-background/50 opacity-60"
                    : "border-border bg-background/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      step.icon
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                      {step.title}
                    </p>
                    {isCurrent && (
                      <>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-2 p-2 rounded bg-muted/50">
                          {step.tip}
                        </p>
                        {step.ctaHref ? (
                          <Link href={step.ctaHref}>
                            <Button size="sm" className="mt-3 text-xs">
                              {step.ctaLabel}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={step.ctaAction}
                            disabled={isDone}
                          >
                            {step.ctaLabel}
                            {!isDone && <ArrowRight className="ml-1 h-3 w-3" />}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
