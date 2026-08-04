import { chromium } from "playwright";

export async function scrapeEnvisionJobs() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto("https://www.envisionnonprofit.com/searches", {
    waitUntil: "networkidle",
  });

  await page.waitForSelector(".filter-item");

  const jobs = await page.$$eval(
  ".filter-item[data-role]",
  (cards) =>
    cards
      .map((card) => {
        const title =
          card.querySelector("h3")?.textContent
            ?.replace(/\s+/g, " ")
            .trim() || "";

        const applyUrl =
          card
            .querySelector("a.uk-position-cover")
            ?.getAttribute("href") || "";

        const location =
          card
            .querySelector(".sc_location")
            ?.textContent
            ?.replace(/\s+/g, " ")
            .trim() || "";

        const role =
          card.getAttribute("data-role") || "";

        const city =
          card.getAttribute("data-location") || "";

        return {
          title,
          organization: "Envision Consulting",
          location: location || city,
          description: "",
          salary: "",
          apply_url: applyUrl,
          source_url: applyUrl,
          source: "Greenhouse",
        };
      })
      .filter(
        (job) =>
          job.title.length > 0 &&
          job.apply_url.length > 0
      )
);
console.log(JSON.stringify(jobs, null, 2));
console.log(jobs);
console.log("Jobs found:", jobs.length);
  await browser.close();

  return jobs;
}