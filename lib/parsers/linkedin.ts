import * as cheerio from "cheerio";

export function parseLinkedInEmail(html: string) {
  const $ = cheerio.load(html);
  const jobs: any[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") || "";
    const decoded = decodeURIComponent(href);

    const match = decoded.match(
      /https?:\/\/(?:www\.)?linkedin\.com\/(?:comm\/)?jobs\/view\/\d+[^\s"'<>]*/i
    );

    if (!match) return;

    const applyUrl = match[0].replace(/&amp;/g, "&");

    if (seen.has(applyUrl)) return;

    const anchor = $(element);

    const title = (
      anchor.attr("aria-label") ||
      anchor.text() ||
      ""
    )
      .replace(/\s+/g, " ")
      .replace(/^(view|apply to)\s+/i, "")
      .replace(/\s+at\s+.+$/i, "")
      .trim();

    if (
      !title ||
      title.length < 3 ||
      title.length > 200 ||
      /view job|see more|apply now/i.test(title)
    ) {
      return;
    }

    const cardText = anchor
      .closest("table")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const organizationMatch = cardText.match(
      /\sat\s+(.+?)(?=\s+(Los Angeles|Remote|Hybrid|California|CA\b|\$)|$)/i
    );

    const organization =
      organizationMatch?.[1]?.trim() || "LinkedIn Employer";

    const location =
      cardText.match(
        /(Los Angeles|Pasadena|Long Beach|Santa Monica|Burbank|Glendale|Remote|Hybrid)[^|•]{0,45}(CA|California)?/i
      )?.[0]?.trim() || "Los Angeles, CA";

    const salary =
      cardText.match(
        /\$[\d,]+(?:\.\d+)?(?:\s*[-–]\s*\$[\d,]+(?:\.\d+)?)?(?:\s*(?:a|per)\s*(?:year|hour))?/i
      )?.[0] || "";

    seen.add(applyUrl);

    jobs.push({
      title,
      organization,
      location,
      salary,
      description: "",
      apply_url: applyUrl,
      source_url: applyUrl,
      source: "LinkedIn",
    });
  });

  return jobs;
}
