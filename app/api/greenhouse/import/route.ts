import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const boardTokens = (process.env.GREENHOUSE_BOARD_TOKENS || "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);

    if (!boardTokens.length) {
      return NextResponse.json(
        {
          success: false,
          error: "GREENHOUSE_BOARD_TOKENS is missing",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let found = 0;
    let saved = 0;
    const errors = new Set<string>();

    for (const token of boardTokens) {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
          token
        )}/jobs?content=true`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        errors.add(`${token}: Greenhouse returned ${response.status}`);
        continue;
      }

      const result = await response.json();
      const jobs = result.jobs || [];

      found += jobs.length;

      for (const job of jobs) {
        const organization = token
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (letter: string) => letter.toUpperCase());

        const normalizedKey = `greenhouse-${token}-${job.id}`;

        const description = String(job.content || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();

        const { error } = await supabase.from("jobs").upsert(
          {
            title: job.title,
            organization,
            location: job.location?.name || "Los Angeles, CA",
            description,
            apply_url: job.absolute_url,
            source_url: job.absolute_url,
            source: "Greenhouse",
            normalized_key: normalizedKey,
            status: "active",
            active: true,
            posted_date: job.updated_at || null,
            last_seen_date: new Date().toISOString(),
          },
          {
            onConflict: "normalized_key",
          }
        );

        if (error) {
          errors.add(`${error.code}: ${error.message}`);
        } else {
          saved++;
        }
      }
    }

    return NextResponse.json({
      success: errors.size === 0,
      source: "Greenhouse",
      found,
      saved,
      errors: Array.from(errors),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Greenhouse import failed",
      },
      { status: 500 }
    );
  }
}
