import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

export async function GET(request: Request) {
  try {
    if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabaseAdmin = getSupabaseAdmin();
    // Get all active subscriptions
    const { data: subscriptions, error: subError } =
      await supabaseAdmin
        .from("email_subscriptions")
        .select("*")
        .eq("active", true);

    if (subError) throw subError;

    let sent = 0;

    for (const subscription of subscriptions ?? []) {
      let query = supabaseAdmin
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by selected sources
      if (
        subscription.sources &&
        subscription.sources.length > 0
      ) {
        query = query.in("source", subscription.sources);
      }

      const { data: jobs, error } = await query;

      if (error) continue;

      let filteredJobs = jobs ?? [];

      // Filter by keywords
      if (
        subscription.keywords &&
        subscription.keywords.length > 0
      ) {
        filteredJobs = filteredJobs.filter((job) =>
          subscription.keywords.some((keyword: string) =>
            (
              job.title +
              " " +
              job.organization +
              " " +
              (job.description || "")
            )
              .toLowerCase()
              .includes(keyword.toLowerCase())
          )
        );
      }

      // Filter by location
      if (
        subscription.locations &&
        subscription.locations.length > 0
      ) {
        filteredJobs = filteredJobs.filter((job) =>
          subscription.locations.some((loc: string) =>
            (job.location || "")
              .toLowerCase()
              .includes(loc.toLowerCase())
          )
        );
      }

      // Limit to 20 jobs
      filteredJobs = filteredJobs.slice(0, 20);

      if (filteredJobs.length === 0) continue;

      const html = `
        <h2>Your Nonprofit Job Digest</h2>

        <p>We found ${filteredJobs.length} matching jobs.</p>

        <hr/>

        ${filteredJobs
          .map(
            (job) => `
          <div style="margin-bottom:30px;">
            <h3>${job.title}</h3>

            <strong>${job.organization}</strong><br/>

            ${job.location || ""}<br/><br/>

            <a href="${job.apply_url}">
              Apply Now
            </a>
          </div>
        `
          )
          .join("")}

        <hr/>

        <p>
          Thank you for using LA Nonprofit Jobs.
        </p>
      `;

      const response = await resend.emails.send({
  from: process.env.EMAIL_FROM || "LA Nonprofit Jobs <onboarding@resend.dev>",
  to: subscription.email,
  subject: "Your Job Digest",
  html,
});

console.log("========== RESEND ==========");
console.dir(response, { depth: null });

if (response.error) {
  console.error("RESEND ERROR:", response.error);
} else {
  console.log("EMAIL ID:", response.data?.id);
}

      await supabaseAdmin
        .from("email_subscriptions")
        .update({
          last_sent_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (!response.error) {
  sent++;
} else {
  console.error(response.error);
}
    }

    return NextResponse.json({
      success: true,
      emailsSent: sent,
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
