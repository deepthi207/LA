import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ["title", "organization", "location", "description", "contact_email"];
    const missing = required.find((field) => !String(body[field] ?? "").trim());
    if (missing) {
      return NextResponse.json({ success: false, error: `${missing} is required` }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(body.contact_email)) {
      return NextResponse.json({ success: false, error: "Enter a valid contact email" }, { status: 400 });
    }

    const clean = (value: unknown, max = 5000) => String(value ?? "").trim().slice(0, max) || null;
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("job_submissions")
      .insert({
        title: clean(body.title, 180), organization: clean(body.organization, 180),
        website: clean(body.website, 500), location: clean(body.location, 180),
        employment_type: clean(body.employment_type, 80), salary: clean(body.salary, 120),
        description: clean(body.description, 30000),
        apply_method: body.apply_method === "email" ? "email" : "url",
        apply_url: clean(body.apply_url, 1000), apply_email: clean(body.apply_email, 320),
        contact_name: clean(body.contact_name, 180),
        contact_email: clean(body.contact_email, 320)?.toLowerCase(),
        contact_phone: clean(body.contact_phone, 80),
        status: "pending",
      })
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: data[0],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
