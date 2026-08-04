import Browserbase from "@browserbasehq/sdk";
import { chromium } from "playwright-core";

type LA2050Job = {
  title: string;
  organization: string;
  location: string;
  salary: string;
  apply_url: string;
  source_url: string;
  source: string;
};

export async function scrapeLA2050WithPlaywright(): Promise<LA2050Job[]> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  if (!apiKey) throw new Error("Missing BROWSERBASE_API_KEY");
  if (!projectId) throw new Error("Missing BROWSERBASE_PROJECT_ID");

  const bb = new Browserbase({ apiKey });
  const session = await bb.sessions.create({ projectId });
  const browser = await chromium.connectOverCDP(session.connectUrl);

  try {
    const context = browser.contexts()[0];
    const page = context.pages()[0] || (await context.newPage());

    await page.goto("https://la2050.org/jobs", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(8000);

    // Scrape the job table directly — real slugs are in the href
    const jobs = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tr"));
      const results: any[] = [];

      for (const row of rows) {
        const link = row.querySelector("a[href*='/job/']") as HTMLAnchorElement;
        if (!link) continue;

        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 2) continue;

        const title = link.textContent?.trim() || "";
        const organization = cells[1]?.textContent?.trim() || "";
        const salary = cells[2]?.textContent?.trim() || "";
        const href = link.href;

        if (!title || !organization || !href.includes("/job/")) continue;

        results.push({
          title,
          organization,
          salary,
          apply_url: href,
          source_url: href,
        });
      }

      return results;
    });

    console.log(`Jobs scraped from table: ${jobs.length}`);
    if (jobs.length > 0) console.log("SAMPLE:", JSON.stringify(jobs[0], null, 2));

    return jobs.map((job) => ({
      title: job.title,
      organization: job.organization,
      location: "Los Angeles, CA",
      salary: job.salary,
      apply_url: job.apply_url,
      source_url: job.source_url,
      source: "LA2050",
    }));

  } finally {
    await browser.close();
  }
}