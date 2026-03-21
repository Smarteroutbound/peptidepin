"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { FREQUENCIES } from "@/lib/constants";

export function NewScheduleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVial = searchParams.get("vial");

  const [userPeptides, setUserPeptides] = useState<any[]>([]);
  const [selectedVialId, setSelectedVialId] = useState(preselectedVial || "");
  const [doseMcg, setDoseMcg] = useState(250);
  const [frequency, setFrequency] = useState("once_daily");
  const [times, setTimes] = useState(["08:00"]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadVials() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = (await supabase
        .from("user_peptides")
        .select("*, peptide:peptides(name)")
        .eq("user_id", user.id)
        .eq("is_active", true)) as { data: any[] | null; error: any };

      setUserPeptides(data || []);

      if (preselectedVial && data) {
        const vial = data.find((v: any) => v.id === preselectedVial);
        if (vial?.dose_per_injection_mcg) {
          setDoseMcg(vial.dose_per_injection_mcg);
        }
      }
    }
    loadVials();
  }, [preselectedVial]);

  useEffect(() => {
    const count =
      frequency === "twice_daily"
        ? 2
        : frequency === "three_daily"
        ? 3
        : 1;
    setTimes((prev) => {
      if (prev.length < count) {
        return [
          ...prev,
          ...Array(count - prev.length)
            .fill("08:00")
            .map((_, i) => {
              const hour = 8 + (prev.length + i) * 6;
              return `${String(Math.min(hour, 22)).padStart(2, "0")}:00`;
            }),
        ];
      }
      return prev.slice(0, count);
    });
  }, [frequency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVialId) {
      toast.error("Please select a vial");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await (supabase.from("dose_schedules") as any).insert({
      user_id: user.id,
      user_peptide_id: selectedVialId,
      dose_mcg: doseMcg,
      frequency,
      times_of_day: times,
    });

    if (error) {
      toast.error("Failed to create schedule");
      setLoading(false);
      return;
    }

    toast.success("Schedule created");
    router.push("/schedule");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Peptide</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVialId} onValueChange={(v) => { if (v) setSelectedVialId(v); }}>
            <SelectTrigger className="touch-target">
              <SelectValue placeholder="Select a vial" />
            </SelectTrigger>
            <SelectContent>
              {userPeptides.map((vial: any) => (
                <SelectItem key={vial.id} value={vial.id}>
                  {vial.custom_label || vial.peptide?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userPeptides.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              No active vials. Add a peptide first.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dosing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Dose (mcg)
            </Label>
            <Input
              type="number"
              value={doseMcg || ""}
              onChange={(e) => setDoseMcg(Number(e.target.value))}
              className="touch-target"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => { if (v) setFrequency(v); }}>
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Time{times.length > 1 ? "s" : ""} of Day
            </Label>
            {times.map((time, i) => (
              <Input
                key={i}
                type="time"
                value={time}
                onChange={(e) => {
                  const newTimes = [...times];
                  newTimes[i] = e.target.value;
                  setTimes(newTimes);
                }}
                className="touch-target"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full touch-target" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Create Schedule
      </Button>
    </form>
  );
}
