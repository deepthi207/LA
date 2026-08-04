import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: "Missing submission id" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const editable = ["title", "organization", "website", "location", "employment_type", "salary", "description", "apply_method", "apply_url", "apply_email"];
    const updates = Object.fromEntries(editable.filter((key) => key in body).map((key) => [key, body[key]]));
    const { error: updateError } = await supabase.from("job_submissions").update(updates).eq("id", body.id);
    if (updateError) throw updateError;
    const { data: jobId, error } = await supabase.rpc("publish_submission", { submission_id: body.id });
    if (error) throw error;
    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to publish" }, { status: 500 });
  }
}
