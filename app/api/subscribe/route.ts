import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      frequency,
      keywords,
      sources,
      locations,
    } = body;

    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid email is required",
        },
        {
          status: 400,
        }
      );
    }

    const allowedFrequencies = ["Daily", "Weekly", "Monthly"];
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("email_subscriptions")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          frequency: allowedFrequencies.includes(frequency) ? frequency : "Weekly",
          keywords: Array.isArray(keywords) ? keywords.slice(0, 20) : [],
          sources: Array.isArray(sources) ? sources.slice(0, 20) : [],
          locations: Array.isArray(locations) ? locations.slice(0, 20) : [],
          active: true,
        },
        {
          onConflict: "email",
        }
      )
      .select();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: data[0],
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
