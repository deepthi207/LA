import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processOrganization } from "@/lib/pipeline/processOrganization";
import { scrapeEnvisionJobs } from "@/lib/scrapers/envision-searches";

export async function GET() {
  try{

    // ==============================
    // Import Envision Searches
    // ==============================
    await supabaseAdmin
  .from("jobs")
  .delete()
  .eq("organization", "Envision Consulting");
    const envisionJobs = await scrapeEnvisionJobs();

    console.log("ENVISION JOBS:", envisionJobs.length);

    for (const job of envisionJobs) {
      const normalizedKey = `envision-${job.title}`
        .toLowerCase()
        .trim();

      const { error } = await supabaseAdmin
        .from("jobs")
        .upsert(
          {
            title: job.title,
            organization: job.organization || "Envision Consulting",
            location: job.location || "",
            salary: job.salary || "",
            description: job.description || "",
            apply_url: job.apply_url || job.source_url,
            source_url: job.source_url,
            source: "Greenhouse",
            normalized_key: normalizedKey,
            status: "active",
            last_seen_date: new Date().toISOString(),
          },
          {
            onConflict: "normalized_key",
          }
        );

      if (error) {
        console.error("ENVISION SAVE ERROR");
        console.error(error);
      }
    }

    // ==============================
    // Existing Organization Pipeline
    // ==============================

    const { data: organizations, error } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .not("website", "is", null)
      .limit(100);

    if (error) throw error;

    const results = [];

    for (const org of organizations ?? []) {
      try {
        const result = await processOrganization(org);

        if (result.jobs && result.jobs.length > 0) {
          for (const job of result.jobs) {
            const normalizedKey = `${result.organization}-${job.title}`
              .toLowerCase()
              .trim();

            const row = {
              organization: result.organization,
              title: job.title,
              apply_url: job.applyUrl,
              source_url: result.careers,
              source: "Other",
              normalized_key: normalizedKey,
              last_seen_date: new Date().toISOString(),
              status: "active",
            };

            const { data, error } = await supabaseAdmin
              .from("jobs")
              .upsert(row, {
                onConflict: "normalized_key",
              })
              .select();

            if (error) {
              console.error(error);
            } else {
              console.log("Saved:", data);
            }
          }
        }

        await supabaseAdmin
          .from("organizations")
          .update({
            last_checked: new Date().toISOString(),
          })
          .eq("id", org.id);

        results.push({
          organization: org.name,
          jobs: result.jobs?.length ?? 0,
          ats: result.ats,
          success: true,
        });

      } catch (err) {
        console.error(err);

        results.push({
          organization: org.name,
          success: false,
        });
      }
    }
    

    return NextResponse.json({
      success: true,
      importedEnvision: envisionJobs.length,
      processedOrganizations: results.length,
      results,
    });

  } catch (err) {
    console.error(err);

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