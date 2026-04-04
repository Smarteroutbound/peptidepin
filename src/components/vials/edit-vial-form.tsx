"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateVialSchema, type UpdateVialInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface EditVialFormProps {
  vial: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVialForm({ vial, open, onOpenChange }: EditVialFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateVialInput>({
    resolver: zodResolver(updateVialSchema),
    defaultValues: {
      custom_label: vial.custom_label || "",
      dose_per_injection_mcg: vial.dose_per_injection_mcg || undefined,
      remaining_mcg: vial.remaining_mcg,
      notes: vial.notes || "",
    },
  });

  const watchedRemaining = watch("remaining_mcg");
  const remainingPct = vial.vial_size_mcg > 0
    ? Math.round(((watchedRemaining ?? vial.remaining_mcg) / vial.vial_size_mcg) * 100)
    : 0;

  const onSubmit = async (data: UpdateVialInput) => {
    try {
      const res = await fetch(`/api/user-peptides/${vial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed to update", { description: err.error });
        return;
      }

      toast.success("Vial updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_label">Custom Label</Label>
            <Input
              id="custom_label"
              placeholder="e.g., Morning BPC"
              {...register("custom_label")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dose_per_injection_mcg">Dose per Injection (mcg)</Label>
            <Input
              id="dose_per_injection_mcg"
              type="number"
              step="any"
              {...register("dose_per_injection_mcg", { valueAsNumber: true })}
            />
            {errors.dose_per_injection_mcg && (
              <p className="text-xs text-destructive">{errors.dose_per_injection_mcg.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remaining_mcg">
              Remaining (mcg) — {remainingPct}% of {vial.vial_size_mcg} mcg
            </Label>
            <Input
              id="remaining_mcg"
              type="number"
              step="any"
              {...register("remaining_mcg", { valueAsNumber: true })}
            />
            {errors.remaining_mcg && (
              <p className="text-xs text-destructive">{errors.remaining_mcg.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Optional notes..."
              {...register("notes")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
