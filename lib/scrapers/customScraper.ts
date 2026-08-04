import axios from "axios";
import * as cheerio from "cheerio";

export interface Job {
  title: string;
  applyUrl: string;
}

export async function scrapeCustomJobs(
  careersUrl: string
): Promise<Job[]> {
  try {
    const { data } = await axios.get(careersUrl, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NonprofitJobsBot/1.0)",
      },
    });

    const $ = cheerio.load(data);

    const jobs: Job[] = [];
    const seen = new Set<string>();

    function isBadTitle(title: string) {
      const t = title.toLowerCase().trim();

      if (!t) return true;
      if (t.length < 6) return true;
      if (t.length > 100) return true;

      // giant URLs
      if (t.includes("http")) return true;
      if (t.includes("linkedin.com")) return true;
      if (t.includes("www.")) return true;
      if (t.includes("@")) return true;

      // navigation
      const bad = [
        "view job",
        "learn more",
        "click here",
        "read more",
        "apply now",
        "apply today",
        "our team",
        "leadership",
        "board",
        "board of directors",
        "staff",
        "employee",
        "about us",
        "contact us",
        "privacy",
        "terms",
        "facebook",
        "linkedin",
        "instagram",
        "youtube",
        "twitter",
        "rss",
        "podcast",
        "newsletter",
        "donate",
        "volunteer",
        "event",
        "webinar",
        "resource",
      ];

      if (bad.some((x) => t.includes(x))) return true;

      return false;
    }

    function looksLikeJobTitle(title: string) {
      return /(director|manager|coordinator|assistant|administrator|specialist|analyst|associate|engineer|officer|representative|executive|teacher|therapist|clinician|navigator|advocate|consultant|accountant|recruiter|intern|case manager|social worker|counselor|program|development|fundraising|finance|hr|human resources|operations|marketing|communications)/i.test(
        title
      );
    }

    function add(title: string, href: string) {
      title = title.replace(/\s+/g, " ").trim();

      if (isBadTitle(title)) return;
      if (!looksLikeJobTitle(title)) return;

      if (!href) return;

      const url = href.startsWith("http")
        ? href
        : new URL(href, careersUrl).href;

      const lowerUrl = url.toLowerCase();

      // reject LinkedIn email tracking URLs
      if (
        lowerUrl.includes("linkedin.com/comm") ||
        lowerUrl.includes("email_job_alert") ||
        lowerUrl.includes("savedsearch") ||
        lowerUrl.includes("markasviewed") ||
        lowerUrl.includes("trackingid") ||
        lowerUrl.includes("trk=")
      )
        return;

      // reject social links
      if (
        lowerUrl.includes("facebook.com") ||
        lowerUrl.includes("instagram.com") ||
        lowerUrl.includes("twitter.com") ||
        lowerUrl.includes("youtube.com")
      )
        return;

      if (seen.has(url)) return;

      seen.add(url);

      jobs.push({
        title,
        applyUrl: url,
      });

      console.log("JOB:", title);
      console.log("URL:", url);
    }

    // Scan only job-like containers
    const selectors = [
      "[class*=job]",
      "[class*=career]",
      "[class*=opening]",
      "[class*=position]",
      "[class*=vacancy]",
      "[id*=job]",
      "[id*=career]",
      "[id*=opening]",
      "article",
      "li",
      "tr",
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const a = $(el).find("a").first();

        if (!a.length) return;

        add(
          a.text(),
          a.attr("href") || ""
        );
      });
    }

    // fallback
    if (jobs.length === 0) {
      $("a").each((_, el) => {
        const href = $(el).attr("href") || "";

        if (
          !/(job|career|opening|position|employment|vacancy|join-us|work-with-us|apply)/i.test(
            href
          )
        )
          return;

        add($(el).text(), href);
      });
    }

    console.log(
      `Finished ${careersUrl} -> ${jobs.length} jobs`
    );

    return jobs;
  } catch (err) {
    console.error(err);
    return [];
  }
}