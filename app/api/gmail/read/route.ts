import { google } from "googleapis";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function GET() {
  const { data: token } = await supabaseAdmin
    .from("gmail_tokens")
    .select("*")
    .eq("email", "admin")
    .single();

  if (!token) {
    return NextResponse.json({ error: "No Gmail token found" }, { status: 404 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: token.refresh_token,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const messages = await gmail.users.messages.list({
    userId: "me",
    q: '(from:idealist.org OR from:linkedin.com OR from:indeed.com OR from:workforgood.org) newer_than:30d',
    maxResults: 10,
  });

  return NextResponse.json(messages.data);
}