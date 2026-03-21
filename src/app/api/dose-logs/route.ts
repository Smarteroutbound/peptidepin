import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await (supabase
    .from("dose_logs") as any)
    .insert({
      user_id: user.id,
      user_peptide_id: body.user_peptide_id,
      schedule_id: body.schedule_id || null,
      dose_mcg: body.dose_mcg,
      volume_ml: body.volume_ml || null,
      scheduled_at: body.scheduled_at || null,
      taken_at: body.taken_at || new Date().toISOString(),
      status: body.status || "taken",
      notes: body.notes || null,
      logged_offline: body.logged_offline || false,
      synced_at: body.logged_offline ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
