"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useLogDose } from "@/hooks/use-log-dose";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ManualLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualLogSheet({ open, onOpenChange }: ManualLogSheetProps) {
  const { logDose, isLogging } = useLogDose();
  const [vials, setVials] = useState<any[]>([]);
  const [vialId, setVialId] = useState<string>("");
  const [doseMcg, setDoseMcg] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [status, setStatus] = useState<"taken" | "skipped">("taken");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    async function loadVials() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = (await supabase
        .from("user_peptides")
        .select("id, custom_label, vial_size_mcg, dose_per_injection_mcg, peptide:peptides(name, category)")
        .eq("user_id", user.id)
        .eq("is_active", true)) as { data: any[] | null; error: any };
      setVials(data || []);
    }
    loadVials();
  }, [open]);

  const selectedVial = vials.find((v) => v.id === vialId);
  const isGLP1 = selectedVial?.peptide?.category === "weight-loss";

  // Auto-fill dose when vial selected
  useEffect(() => {
    if (selectedVial?.dose_per_injection_mcg && doseMcg === 0) {
      setDoseMcg(selectedVial.dose_per_injection_mcg);
    }
  }, [vialId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!vialId) {
      toast.error("Select a vial");
      return;
    }
    if (!doseMcg || doseMcg <= 0) {
      toast.error("Enter a valid dose");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const result = await logDose({
      user_peptide_id: vialId,
      dose_mcg: doseMcg,
      scheduled_at: scheduledAt,
      status,
      notes: notes || undefined,
    });

    if (result) {
      onOpenChange(false);
      // Reset form
      setVialId("");
      setDoseMcg(0);
      setNotes("");
      setStatus("taken");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log a Dose</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Backdate or log an unscheduled dose
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Vial */}
          <div className="space-y-1.5">
            <Label htmlFor="vial" className="text-xs text-muted-foreground">Vial</Label>
            <select
              id="vial"
              value={vialId}
              onChange={(e) => setVialId(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select a vial</option>
              {vials.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.custom_label || v.peptide?.name} — {(v.vial_size_mcg / 1000).toFixed(0)}mg
                </option>
              ))}
            </select>
          </div>

          {/* Dose */}
          <div className="space-y-1.5">
            <Label htmlFor="dose" className="text-xs text-muted-foreground">
              Dose {isGLP1 ? "(mg)" : "(mcg)"}
            </Label>
            {isGLP1 ? (
              <Input
                id="dose"
                type="number"
                step="0.01"
                value={doseMcg / 1000 || ""}
                onChange={(e) => setDoseMcg(Number(e.target.value) * 1000)}
                className="h-11"
              />
            ) : (
              <Input
                id="dose"
                type="number"
                step="any"
                value={doseMcg || ""}
                onChange={(e) => setDoseMcg(Number(e.target.value))}
                className="h-11"
              />
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-xs text-muted-foreground">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("taken")}
                className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                  status === "taken"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Taken
              </button>
              <button
                type="button"
                onClick={() => setStatus("skipped")}
                className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                  status === "skipped"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Skipped
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-muted-foreground">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any side effects?"
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLogging}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLogging} className="flex-1">
            {isLogging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Dose
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
