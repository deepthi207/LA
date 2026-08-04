import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { discoverOrganizations } from "@/lib/discovery/discoverOrganizations";

export async function GET() {
  try {
    const organizations = await discoverOrganizations();
    let inserted = 0;

    for (const org of organizations) {
      console.log("Processing:", org.name);

      const { data, error } = await supabaseAdmin
        .from("organizations")
        .upsert(
          {
            name: org.name,
            website: org.website,
            city: org.city,
            county: org.county,
            state: org.state,
            active: true,
            last_checked: new Date().toISOString(),
          },
          {
            onConflict: "name",
          }
        )
        .select();

      console.log("Returned data:", data);

      if (error) {
        console.error("UPSERT ERROR:", error);
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      discovered: organizations.length,
      inserted,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}