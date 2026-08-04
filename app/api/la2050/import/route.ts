import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { scrapeLA2050WithPlaywright } from "../../../../lib/scrapers/la2050-playwright";
export async function GET() {
  try {
    const jobs = await scrapeLA2050WithPlaywright();

    let saved = 0;
    const errors: any[] = [];

    for (const job of jobs) {
      const { error } = await supabaseAdmin
        .from("jobs")
        .upsert(
          {
            title: job.title,
            organization: job.organization,
            location: job.location,
            salary: job.salary,
            apply_url: job.apply_url,
            source_url: job.source_url,
            source: job.source,
          },
          {
            onConflict: "title,organization",
          }
        );

      if (error) {
        console.error("Supabase Error:", error);
        errors.push(error);
      } else {
        saved++;
      }
    }

    return NextResponse.json({
      success: true,
      source: "LA2050",
      jobsFound: jobs.length,
      saved,
      errors,
      jobs,
    });
  } catch (error: any) {
    console.error("LA2050 Import Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unknown Error",
        stack: error?.stack || null,
      },
      {
        status: 500,
      }
    );
  }
}