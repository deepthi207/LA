import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: "Missing submission id" }, { status: 400 });
    const { error } = await getSupabaseAdmin().from("job_submissions").update({
      status: "rejected",
      reviewer_notes: String(body.reject_reason ?? "").trim().slice(0, 5000),
    }).eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to reject" }, { status: 500 });
  }
}
