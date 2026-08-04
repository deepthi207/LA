import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/gmail";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({
      success: false,
      error: "No authorization code received",
    });
  }

  const { tokens } = await oauth2Client.getToken(code);

  console.log("GOOGLE TOKENS:");
  console.log(tokens);

  return NextResponse.json({
    success: true,
    tokens,
  });
}