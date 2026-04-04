"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { EditVialForm } from "@/components/vials/edit-vial-form";
import { ArchiveVialDialog } from "@/components/vials/archive-vial-dialog";

interface VialActionsProps {
  vial: any;
}

export function VialActions({ vial }: VialActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Vial options</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit Vial
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setArchiveOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Archive / Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditVialForm vial={vial} open={editOpen} onOpenChange={setEditOpen} />
      <ArchiveVialDialog
        vialId={vial.id}
        vialName={vial.custom_label || vial.peptide?.name || "this vial"}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
    </>
  );
}
