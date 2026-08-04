import { NextResponse } from "next/server";
import { scrapeCustomJobs } from "@/lib/scrapers/customScraper";

export async function GET() {

  const jobs = await scrapeCustomJobs(
    "https://www.ngoisac.org/careers"
  );

  return NextResponse.json({
    total: jobs.length,
    jobs
  });

}