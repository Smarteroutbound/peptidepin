"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ArchiveVialDialogProps {
  vialId: string;
  vialName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveVialDialog({
  vialId,
  vialName,
  open,
  onOpenChange,
}: ArchiveVialDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-peptides/${vialId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed", { description: err.error });
        return;
      }

      const result = await res.json();

      if (result.archived) {
        toast.success("Vial archived", {
          description: "Archived because it has dose history. You can still view it.",
        });
      } else {
        toast.success("Vial deleted");
      }

      onOpenChange(false);
      router.push("/my-peptides");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Remove "${vialName}"?`}
      description="If this vial has dose history, it will be archived instead of deleted. Archived vials can still be viewed in your history."
      confirmLabel="Remove"
      variant="destructive"
      onConfirm={handleConfirm}
      loading={loading}
    />
  );
}
