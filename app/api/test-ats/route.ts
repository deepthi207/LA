import { NextResponse } from "next/server";
import { detectATS } from "@/lib/discovery/detectATS";

export async function GET() {

  const result = await detectATS(
    "https://www.ngoisac.org/careers"
  );

  return NextResponse.json(result);

}