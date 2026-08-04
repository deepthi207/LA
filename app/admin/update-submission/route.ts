import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;
    const allowed = ["title", "organization", "website", "location", "employment_type", "salary", "description", "apply_method", "apply_url", "apply_email", "status"];
    const updates = Object.fromEntries(allowed.filter((key) => key in body).map((key) => [key, body[key]]));
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("job_submissions")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      {
        status: 500,
      }
    );

  }
}
