import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/users/[id]">) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const freeReadings = Number(body.free_readings);
  const update = {
    display_name: typeof body.display_name === "string" ? body.display_name : null,
    preferred_locale: typeof body.preferred_locale === "string" ? body.preferred_locale : null,
    free_readings: Number.isFinite(freeReadings) && freeReadings >= 0 ? Math.floor(freeReadings) : 0,
  };

  const { error } = await supabase.from("profiles").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
