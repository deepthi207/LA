import axios from "axios";
import * as cheerio from "cheerio";

const HIGH_PRIORITY = [
  "/careers",
  "/career",
  "/jobs",
  "/job",
  "/employment",
];

const KEYWORDS = [
  "careers",
  "career",
  "jobs",
  "job",
  "employment",
  "join-us",
  "join",
  "work-with-us",
  "work with us",
  "opportunities",
];

export async function findCareersPage(
  website: string
): Promise<string |null> {

  try {

    const { data } = await axios.get(website, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NonprofitJobsBot/1.0)"
      }
    });

    const $ = cheerio.load(data);

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(Boolean) as string[];

    let fallback: string | null = null;

    for (const href of links) {

      const lower = href.toLowerCase();

      // Highest priority
      if (
        HIGH_PRIORITY.some(
          p =>
            lower.endsWith(p) ||
            lower.includes(p)
        )
      ) {

        if (href.startsWith("http")) {
          return href;
        }

        return new URL(href, website).href;
      }

      // Save fallback links
      if (
        !fallback &&
        KEYWORDS.some(k => lower.includes(k))
      ) {

        fallback = href.startsWith("http")
          ? href
          : new URL(href, website).href;

      }

    }

    return fallback;

  } catch (err) {

    console.error(err);

    return null;

  }

}