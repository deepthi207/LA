import * as cheerio from "cheerio";

type ParsedJob = {
  title: string;
  organization: string;
  location: string;
  salary: string;
  apply_url: string;
  source_url: string;
  source: string;
};

export function parseIdealist(html: string): ParsedJob[] {
  const $ = cheerio.load(html);

  const jobs: ParsedJob[] = [];
  const seen = new Set<string>();

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";

    const decoded = decodeURIComponent(href);

    if (!decoded.includes("idealist.org/en/nonprofit-job/")) return;

    const match = decoded.match(
      /https:\/\/(?:track\.pstmrk\.it\/3s\/)?(?:www\.)?idealist\.org\/en\/nonprofit-job\/([^?\/]+)/
    );

    if (!match) return;

    // Clean tracking URL
    const applyUrl =
      "https://www.idealist.org/en/nonprofit-job/" + match[1];

    const title = $(el).text().replace(/\s+/g, " ").trim();

    if (!title) return;

    const card = $(el).closest("table");

    const text = card.text().replace(/\s+/g, " ").trim();

    const salary =
      text.match(
        /USD\s*\$[\d,]+(?:\s*-\s*\$[\d,]+)?\s*\/\s*(?:year|hour)/i
      )?.[0] || "";

    // Find organization by removing known pieces
    let organization = text
      .replace(title, "")
      .replace(salary, "")
      .replace(/Here are your new updates.*?:/i, "")
      .replace(/See All Jobs.*/i, "")
      .replace(/Cancel this email alert.*/i, "")
      .trim();

    // Keep only first sentence/line
    organization = organization.split("Los Angeles")[0].trim();

    const afterSalary = salary
  ? text.substring(text.indexOf(salary) + salary.length)
  : text;

const locationMatch = afterSalary.match(/[A-Za-z ]+,\s*[A-Z]{2}/);

const location = locationMatch
  ? locationMatch[0].trim()
  : "Los Angeles, CA";

    const key = `${title}-${organization}`;

    if (seen.has(key)) return;

    seen.add(key);

    jobs.push({
      title,
      organization,
      location,
      salary,
      apply_url: applyUrl,
      source_url: applyUrl,
      source: "Idealist",
    });
  });

  console.log("Idealist jobs found:", jobs.length);

  return jobs;
}