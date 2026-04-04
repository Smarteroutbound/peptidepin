import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logDoseSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = logDoseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // C1 FIX: Verify the vial belongs to this user
    const { data: vial } = await (supabase.from("user_peptides") as any)
      .select("id")
      .eq("id", parsed.data.user_peptide_id)
      .eq("user_id", user.id)
      .single();

    if (!vial) {
      return NextResponse.json({ error: "Vial not found" }, { status: 404 });
    }

    const { data, error } = await (supabase.from("dose_logs") as any)
      .insert({
        user_id: user.id,
        user_peptide_id: parsed.data.user_peptide_id,
        schedule_id: parsed.data.schedule_id || null,
        dose_mcg: parsed.data.dose_mcg,
        volume_ml: parsed.data.volume_ml || null,
        scheduled_at: parsed.data.scheduled_at || null,
        taken_at: new Date().toISOString(),
        status: parsed.data.status || "taken",
        notes: parsed.data.notes || null,
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
