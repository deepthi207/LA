import axios from "axios";
import * as cheerio from "cheerio";

export interface ATSResult {
  ats: string;
  boardUrl: string | null;
}

export async function detectATS(
  careersUrl: string
): Promise<ATSResult> {
  try {
    const { data } = await axios.get(careersUrl, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NonprofitJobsBot/1.0)",
      },
    });

    const html = data.toLowerCase();
    const $ = cheerio.load(data);

    // Check all links on the page
    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(Boolean) as string[];

    for (const link of links) {
      const href = link.toLowerCase();

      if (href.includes("boards.greenhouse.io")) {
        return { ats: "Greenhouse", boardUrl: link };
      }

      if (href.includes("jobs.lever.co")) {
        return { ats: "Lever", boardUrl: link };
      }

      if (href.includes("myworkdayjobs.com")) {
        return { ats: "Workday", boardUrl: link };
      }

      if (href.includes("ashbyhq.com")) {
        return { ats: "Ashby", boardUrl: link };
      }

      if (href.includes("bamboohr.com")) {
        return { ats: "BambooHR", boardUrl: link };
      }

      if (href.includes("smartrecruiters.com")) {
        return { ats: "SmartRecruiters", boardUrl: link };
      }

      if (href.includes("icims.com")) {
        return { ats: "iCIMS", boardUrl: link };
      }

      if (href.includes("jobvite.com")) {
        return { ats: "Jobvite", boardUrl: link };
      }
    }

    // Fallback: check page HTML
    if (html.includes("boards.greenhouse.io"))
      return { ats: "Greenhouse", boardUrl: careersUrl };

    if (html.includes("jobs.lever.co"))
      return { ats: "Lever", boardUrl: careersUrl };

    if (html.includes("myworkdayjobs.com"))
      return { ats: "Workday", boardUrl: careersUrl };

    return {
      ats: "Custom",
      boardUrl: careersUrl,
    };
  } catch {
    return {
      ats: "Unknown",
      boardUrl: null,
    };
  }
}