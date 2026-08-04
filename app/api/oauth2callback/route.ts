import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getGoogleOAuthClient } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  const oauth2Client = getGoogleOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error: "No refresh token returned. Try visiting /api/auth-url again.",
      },
      { status: 400 }
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("gmail_tokens")
    .upsert({
      email: "admin",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
    }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Gmail token saved!",
  });
}
