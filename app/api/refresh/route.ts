
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { supabaseAdmin } from "../../../lib/supabase-admin";


export async function GET() {
  const response = await axios.get(
  "https://www.idealist.org/en/jobs?location=Los%20Angeles%2C%20CA"
);

const $ = cheerio.load(response.data);

const sampleJobs: any[] = [];

$("a").each((_, element) => {
  const title = $(element).text().trim();

  if (title.length > 10 && sampleJobs.length < 20) {
    sampleJobs.push({
      title,
      organization: "Idealist",
      location: "Los Angeles, CA",
      source: "Idealist",
    });
  }
});
const { data, error } = await supabaseAdmin
  .from("jobs")
  .insert(sampleJobs)
  .select();

if (error) {
  return NextResponse.json(
    { success: false, error },
    { status: 500 }
  );
}

return NextResponse.json({
  success: true,
  inserted: data,
});
}