import { NextResponse } from "next/server";
import { importJobsFromGmail } from "@/lib/gmail/importer";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const results = await importJobsFromGmail();

    const jobs = results.flatMap((r) => r.jobs || []);

    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const job of jobs) {
      if (!job.apply_url) continue;

      const { data: existing, error: lookupError } = await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("apply_url", job.apply_url)
        .maybeSingle();

      if (lookupError) {
        errors.push(lookupError.message);
        continue;
      }

      if (existing) {
        const { error } = await supabaseAdmin
          .from("jobs")
          .update(job)
          .eq("id", existing.id);

        if (error) {
          errors.push(error.message);
        } else {
          updated++;
        }
      } else {
        const { error } = await supabaseAdmin
          .from("jobs")
          .insert(job);

        if (error) {
          errors.push(error.message);
        } else {
          inserted++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsProcessed: results.length,
      found: jobs.length,
      inserted,
      updated,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
