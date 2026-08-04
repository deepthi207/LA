import * as cheerio from "cheerio";

export interface ParsedOrganization {
  name: string;
  website: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  phone: string | null;
  address: string | null;
}

export function parseGrowthZone(html: string): ParsedOrganization[] {
  const $ = cheerio.load(html);

  const organizations: ParsedOrganization[] = [];

  $(".gz-card, .card").each((_, el) => {

    const name =
    $(el).find("h2,h3,.card-title").first().text().trim() || "Unknown";

  const links = $(el)
    .find("a")
    .map((_, a) => $(a).attr("href"))
    .get();

  console.log(name, links);
  });

  return organizations;
}