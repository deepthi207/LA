import axios from "axios";
import * as cheerio from "cheerio";
import { findWebsiteFromSearchResult } from "./findWebsite";

export async function discoverCalNonprofits() {
  const url = "https://members.calnonprofits.org/member-directory/Find";

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const organizations: any[] = [];

  const cards = $(".card, .gz-card").toArray();

  for (const el of cards) {
    const name =
      $(el).find("h2,h3,.card-title").first().text().trim();

    const rawWebsite =
      $(el).find("a[href^='http']").first().attr("href") || null;

    if (!name) continue;

    const website = await findWebsiteFromSearchResult(name, rawWebsite);

    organizations.push({
      name,
      website,
      city: null,
      county: null,
      state: "CA",
    });
  }

  return organizations;
}