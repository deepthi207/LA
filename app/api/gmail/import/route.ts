import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { importJobsFromGmail } from "../../../../lib/gmail/importer";

export async function GET() {
  try {
    const emails = await importJobsFromGmail();

    const results = [];

    for (const email of emails) {
      let saved = 0;
      let skipped = 0;
      let failed = 0;

      for (const job of email.jobs) {
        const textToCheck = `
  ${job.title || ""}
  ${job.organization || ""}
  ${job.description || ""}
`.toLowerCase();

const nonprofitKeywords = [
  "nonprofit",
  "non profit",
  "foundation",
  "charity",
  "museum",
  "arts",
  "community",
  "center",
  "youth",
  "education",
  "school",
  "college",
  "university",
  "healthcare foundation",
  "human services",
  "social services",
  "advocacy",
  "volunteer",
  "development",
  "fundraising",
  "philanthropy",
  "donor",
  "grant",
];

const badKeywords = [
  "boeing",
  "airport",
  "billing",
  "claims",
  "payroll processor",
  "manufacturing",
  "warehouse",
  "construction",
  "government billing",
  "risk manager",
];

const isRelevant =
  nonprofitKeywords.some((word) => textToCheck.includes(word)) &&
  !badKeywords.some((word) => textToCheck.includes(word));

if (!isRelevant) {
  skipped++;
  continue;
}
        if (!job.title || !job.organization) {
          skipped++;
          continue;
        }

        if (
          job.title.includes("<") ||
          job.organization.includes("<") ||
          job.location?.includes("<") ||
          job.title.includes("@media") ||
          job.organization.includes("@media") ||
          job.title.length > 200 ||
          job.organization.length > 200
        ) {
          skipped++;
          continue;
        }

        const normalizedKey = `${job.source}-${job.organization}-${job.title}`
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        const { error } = await supabaseAdmin.from("jobs").upsert(
          {
            title: job.title,
            organization: job.organization,
            location: job.location || "",
            salary: job.salary || "",
            apply_url: job.apply_url || null,
            source_url: job.source_url || job.apply_url || null,
            source: job.source,
            normalized_key: normalizedKey,
            status: "active",
            last_seen_date: new Date().toISOString(),
          },
          {
            onConflict: "normalized_key",
          }
        );

        if (error) {
  failed++;

  console.error("================================");
  console.error("SUPABASE ERROR");
  console.error("TITLE:", job.title);
  console.error("ORG:", job.organization);
  console.error(error);
  console.error("================================");
} else {
  saved++;
}
      }

      results.push({
        subject: email.subject,
        from: email.from,
        jobsFound: email.jobs.length,
        saved,
        skipped,
        failed,
      });
    }

    return NextResponse.json({
      success: true,
      emailsScanned: emails.length,
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
        status: 500 }
    );
  }
}