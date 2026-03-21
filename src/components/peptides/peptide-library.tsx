"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { mcgToMg } from "@/lib/calculations";
import type { Database } from "@/types/database";

type Peptide = Database["public"]["Tables"]["peptides"]["Row"];

export function PeptideLibrary({ peptides }: { peptides: Peptide[] }) {
  const [search, setSearch] = useState("");

  const filtered = peptides.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(peptides.map((p) => p.category).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search peptides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="touch-target pl-9"
        />
      </div>

      {!search && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer text-xs capitalize"
              onClick={() => setSearch(cat || "")}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((peptide) => (
          <Link key={peptide.id} href={`/library/${peptide.slug}`}>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{peptide.name}</p>
                    {peptide.category && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {peptide.category}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {mcgToMg(peptide.typical_vial_size_mcg)}mg vial &middot;{" "}
                    {peptide.recommended_frequency || "See dosing info"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No peptides found for &quot;{search}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
