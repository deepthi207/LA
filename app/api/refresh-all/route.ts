import { NextResponse } from "next/server";

export const maxDuration = 300;

async function runImporter(url: string, source: string) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    const result = await response.json();

    return {
      source,
      success: response.ok && result.success !== false,
      result,
    };
  } catch (error) {
    return {
      source,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function POST(request: Request) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !==
      `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const origin = new URL(request.url).origin;

  const [gmail, greenhouse, la2050] = await Promise.all([
    runImporter(
      `${origin}/api/gmail/import`,
      "Gmail: Indeed, LinkedIn, Idealist and Dan's List"
    ),
    runImporter(`${origin}/api/greenhouse/import`, "Greenhouse"),
    runImporter(`${origin}/api/la2050/import`, "LA2050"),
  ]);

  return NextResponse.json({
    success: true,
    sources: [gmail, greenhouse, la2050],
  });
}
