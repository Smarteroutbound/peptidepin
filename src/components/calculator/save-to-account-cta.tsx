"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle2, Bell, Clock, ArrowRight } from "lucide-react";

interface SaveToAccountCTAProps {
  peptideId?: string;
  peptideName?: string;
  vialSizeMcg: number;
  bacWaterMl: number;
  doseMcg: number;
}

/**
 * Shown under the calculator result. Prompts users to save their setup
 * to their account so they can track doses and get reminders. Auth-aware:
 * shows "Sign in to save" for anon users, "Save to account" for logged-in.
 */
export function SaveToAccountCTA({
  peptideId,
  peptideName,
  vialSizeMcg,
  bacWaterMl,
  doseMcg,
}: SaveToAccountCTAProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
    });
  }, []);

  // Build query params to prefill the add vial form
  const qs = new URLSearchParams();
  if (peptideId) qs.set("peptide", peptideId);
  if (vialSizeMcg) qs.set("vial_size", String(vialSizeMcg));
  if (bacWaterMl) qs.set("bac_water", String(bacWaterMl));
  if (doseMcg) qs.set("dose", String(doseMcg));

  const addVialHref = `/my-peptides/new?${qs.toString()}`;
  const loginHref = `/login?redirect=${encodeURIComponent(addVialHref)}`;

  if (isAuthed === null) return null; // loading

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-base mb-1">
              {isAuthed ? "Save this to your account" : "Track this peptide"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAuthed
                ? `Save ${peptideName || "this vial"} so you can log doses, get reminders, and never miss an injection.`
                : `Create a free account to save ${peptideName || "this vial"}, log doses, and get reminders. Your calculation stays saved.`}
            </p>
          </div>
        </div>

        {/* Value props */}
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            Track every dose automatically
          </li>
          <li className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            Dose reminders at your scheduled times
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            Vial expiry countdown (28-day shelf life)
          </li>
        </ul>

        <Link href={isAuthed ? addVialHref : loginHref}>
          <Button className="w-full min-h-[48px] text-sm font-semibold">
            {isAuthed ? "Add to My Vials" : "Create Free Account"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
