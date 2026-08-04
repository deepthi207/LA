import * as cheerio from "cheerio";
// Dump raw HTML to file so we can see exactly what Indeed is sending


export function parseIndeedHTML(html: string) {
  const jobs: any[] = [];

  const $ = cheerio.load(html);

  $("a[href*='/rc/clk/dl']").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const card = $(el);
    const fullText = card.text().replace(/\s+/g, " ").trim();

    // ── Title ──────────────────────────────────────────
    const title = card.find("h2, h3").first().text().replace(/\s+/g, " ").trim();
    if (!title) {
      console.log("SKIPPING — no title found. Card text:", fullText.slice(0, 100));
      return;
    }

    // ── All td texts (for debugging) ──────────────────
    const tdTexts: string[] = [];
    card.find("td").each((_, td) => {
      const txt = $(td).text().replace(/\s+/g, " ").trim();
      if (txt) tdTexts.push(txt);
    });
    console.log("TD TEXTS for", title, ":", tdTexts);

    // ── Organization ──────────────────────────────────
    // Try common patterns: <span> or <td> that isn't the title, location, salary
    let organization = "";

    // Pattern 1: look for a span/div with company-like content
    card.find("span, div").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (
        txt &&
        txt !== title &&
        txt.length < 80 &&
        txt.length > 2 &&
        !txt.includes("$") &&
        !txt.match(/,\s?[A-Z]{2}(\s|$)/) &&
        !txt.includes("out of 5") &&
        !txt.includes("Easily apply") &&
        !txt.includes("Just posted") &&
        !txt.includes("days ago") &&
        !txt.includes("day ago") &&
        organization === ""
      ) {
        organization = txt;
      }
    });

    // Pattern 2: fallback to td
    if (!organization) {
      card.find("td").each((_, td) => {
        const txt = $(td).text().replace(/\s+/g, " ").trim();
        if (
          txt &&
          txt !== title &&
          txt.length < 80 &&
          !txt.includes("$") &&
          !txt.match(/,\s?[A-Z]{2}(\s|$)/) &&
          !txt.includes("out of 5") &&
          !txt.includes("Easily apply") &&
          !txt.includes("Just posted") &&
          !txt.includes("days ago") &&
          organization === ""
        ) {
          organization = txt;
        }
      });
    }

    // ── Location ──────────────────────────────────────
    let location = "";
    card.find("td, span, div").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (txt.match(/,\s?[A-Z]{2}(\s|$)/) && !location) {
        location = txt;
      }
    });

    // ── Salary ────────────────────────────────────────
    let salary = "";
    card.find("*").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (txt.includes("$") && txt.length < 60 && !salary) {
        salary = txt;
      }
    });

    // ── Description ───────────────────────────────────
    let description = "";
    card.find("td, span, div, p").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (
        txt.length > 60 &&
        txt !== title &&
        !txt.includes("Just posted") &&
        !txt.includes("days ago") &&
        !txt.includes("$") &&
        !txt.match(/,\s?[A-Z]{2}$/) &&
        description === ""
      ) {
        description = txt;
      }
    });

    const apply_url = href.startsWith("http")
      ? href
      : `https://www.indeed.com${href}`;

    console.log("PARSED JOB:", { title, organization, location, salary, apply_url });

    jobs.push({
      title,
      organization,
      location,
      salary,
      description,
      apply_url,
      source_url: apply_url,
      source: "Indeed",
    });
  });

  console.log("Indeed HTML jobs:", jobs.length);
  return jobs;
}