"use client";

import { useState, useEffect } from "react";
import { useLogDose } from "@/hooks/use-log-dose";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Check, Loader2 } from "lucide-react";

interface NextDoseHeroProps {
  dose: {
    scheduleId: string;
    userPeptideId: string;
    peptideName: string;
    doseMcg: number;
    syringeUnits: number;
    scheduledTime: string;
    isGLP1: boolean;
  } | null;
}

export function NextDoseHero({ dose }: NextDoseHeroProps) {
  const { logDose, isLogging } = useLogDose();
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!dose) return;
    function updateCountdown() {
      const now = new Date();
      const [h, m] = dose!.scheduledTime.split(":");
      const target = new Date();
      target.setHours(parseInt(h), parseInt(m), 0, 0);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        const overdue = Math.abs(diff);
        if (overdue < 60000) setTimeLeft("now");
        else {
          const mins = Math.floor(overdue / 60000);
          setTimeLeft(mins < 60 ? `${mins}m overdue` : `${Math.floor(mins / 60)}h overdue`);
        }
      } else {
        const mins = Math.floor(diff / 60000);
        if (mins < 60) setTimeLeft(`in ${mins}m`);
        else setTimeLeft(`in ${Math.floor(mins / 60)}h ${mins % 60}m`);
      }
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [dose]);

  if (!dose) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <Check className="h-10 w-10 text-primary mx-auto mb-2" />
          <p className="font-heading font-semibold">All caught up!</p>
          <p className="text-sm text-muted-foreground">No more doses today</p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <Check className="h-10 w-10 text-primary mx-auto mb-2" />
          <p className="font-heading font-semibold">Done!</p>
        </CardContent>
      </Card>
    );
  }

  const doseLabel = dose.isGLP1 && dose.doseMcg >= 1000
    ? `${(dose.doseMcg / 1000).toFixed(1)} mg`
    : `${dose.doseMcg} mcg`;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Dose</p>
            <p className="text-lg font-heading font-bold">{dose.peptideName}</p>
          </div>
          <span className="text-sm font-medium text-primary">{timeLeft}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Syringe className="h-4 w-4" />
          <span>{doseLabel} · Draw <strong className="text-foreground">{dose.syringeUnits} units</strong></span>
        </div>

        <Button
          className="w-full min-h-[56px] text-base font-semibold"
          disabled={isLogging}
          onClick={async () => {
            const today = new Date().toISOString().split("T")[0];
            await logDose({
              user_peptide_id: dose.userPeptideId,
              schedule_id: dose.scheduleId,
              dose_mcg: dose.doseMcg,
              scheduled_at: `${today}T${dose.scheduledTime}:00`,
              status: "taken",
            });
            setDone(true);
          }}
        >
          {isLogging ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Take Now
        </Button>
      </CardContent>
    </Card>
  );
}
