"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MoreVertical, Pause, Play, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FREQUENCIES } from "@/lib/constants";

interface ScheduleListProps {
  schedules: any[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const active = schedules.filter((s) => s.is_active);
  const paused = schedules.filter((s) => !s.is_active);

  async function togglePause(id: string, currentlyActive: boolean) {
    const res = await fetch(`/api/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !currentlyActive }),
    });
    if (res.ok) {
      toast.success(currentlyActive ? "Schedule paused" : "Schedule resumed");
      router.refresh();
    } else {
      toast.error("Failed to update schedule");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/schedules/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Schedule deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
    setDeleting(false);
    setDeleteId(null);
  }

  function getFrequencyLabel(freq: string) {
    return FREQUENCIES.find((f) => f.value === freq)?.label || freq;
  }

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }

  function renderScheduleCard(schedule: any) {
    const peptideName =
      schedule.user_peptide?.custom_label ||
      schedule.user_peptide?.peptide?.name ||
      "Unknown";
    const times = schedule.times_of_day || [];

    return (
      <Card key={schedule.id}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{peptideName}</p>
                {!schedule.is_active && (
                  <Badge variant="secondary" className="text-[10px]">Paused</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {schedule.dose_mcg >= 1000
                  ? `${(schedule.dose_mcg / 1000).toFixed(1)} mg`
                  : `${schedule.dose_mcg} mcg`}{" "}
                · {getFrequencyLabel(schedule.frequency)}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Clock className="h-3 w-3" />
                {times.map((t: string) => formatTime(t)).join(", ")}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => togglePause(schedule.id, schedule.is_active)}>
                  {schedule.is_active ? (
                    <><Pause className="mr-2 h-3.5 w-3.5" /> Pause</>
                  ) : (
                    <><Play className="mr-2 h-3.5 w-3.5" /> Resume</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteId(schedule.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {active.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</h3>
            {active.map(renderScheduleCard)}
          </div>
        )}
        {paused.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Paused</h3>
            {paused.map(renderScheduleCard)}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete schedule?"
        description="This will permanently remove this schedule. Your dose history will be kept."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
