import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addVialSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addVialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { peptide_id, custom_label, vial_size_mcg, bac_water_ml, dose_per_injection_mcg, notes, date_reconstituted } = parsed.data;

    const { data, error } = await (supabase.from("user_peptides") as any)
      .insert({
        user_id: user.id,
        peptide_id,
        custom_label: custom_label || null,
        vial_size_mcg,
        bac_water_ml,
        remaining_mcg: vial_size_mcg,
        dose_per_injection_mcg: dose_per_injection_mcg || null,
        notes: notes || null,
        date_reconstituted: date_reconstituted || new Date().toISOString().split("T")[0],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
