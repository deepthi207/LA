import { google } from "googleapis";
import { supabaseAdmin } from "../supabase-admin";

export async function getGmailClient() {
  const { data: token, error } = await supabaseAdmin
    .from("gmail_tokens")
    .select("*")
    .eq("email", "admin")
    .single();

  if (error || !token) {
    throw new Error("No Gmail token found.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: token.refresh_token,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}