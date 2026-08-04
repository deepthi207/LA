import { NextResponse } from "next/server";
import { findCareersPage } from "@/lib/discovery/findCareers";

export async function GET() {

  const careers = await findCareersPage(
    "https://www.ngoisac.org/"
  );

  return NextResponse.json({
    careers,
  });

}