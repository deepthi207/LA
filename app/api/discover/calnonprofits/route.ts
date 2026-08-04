import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const organization = {
    name: "Sample Nonprofit",
    website: "https://example.org",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    active: true,
    last_checked: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("organizations")
    .insert(organization)
    .select();

  return NextResponse.json({
    success: !error,
    error,
    data,
  });
}