import * as cheerio from "cheerio";

export interface ParsedJob {
  title: string;
  organization: string;
  location: string;
  description: string;
  apply_url: string;
  source: string;
  posted_date: string | null;
}

interface Link {
  href: string;
  text: string;
}

interface Line {
  text: string;
  links: Link[];
  mailtos: Link[];
}

const LABELS = [
  "employer",
  "location",
  "salary",
  "employment type",
  "closing date",
  "deadline",
  "deadline to apply",
];

// Footer / disclaimer / boilerplate that occasionally survives as its own
// "block" (e.g. the unsubscribe line, Dan's standing disclaimer). None of
// these are real job postings.
const NOISE =
  /(unsubscribe|update profile|constant contact|dans-?list.*disclaimer|i send out these jobs|coming soon|my guidelines|have a friend or colleague|my best,|dan rothblatt)/i;

const DATE_LINE = /^[A-Z][a-z]{2,8}\s+\d{1,2},\s*\d{4}$/;

function cleanText(raw: string): string {
  return raw.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function isUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

const isShortLine = (l: Line) => l.text.length <= 80 && !/[.]\s.+[.]/.test(l.text);

/**
 * Parses a Dan's List (Constant Contact) email into structured job postings.
 *
 * Dan's List is a manually-curated email newsletter, not a scrapable
 * website — every posting is just plain paragraphs pasted into the email
 * body, in a handful of recurring shapes:
 *
 *   1. "short"      Title / Organization / Location / bare-URL
 *                    (common for jewishjobs.com re-posts — 4 lines exactly)
 *   2. "labeled"     Title, then "Employer"/"Location"/"Salary" label lines
 *                    each immediately followed by their value
 *   3. "positional"  Title / Org / Location / (salary, type, etc.) / Description
 *                    (common when pasted from job boards like NYFA)
 *   4. "freeform"    Everything else — long prose postings with no
 *                    reliable machine-parseable structure. Title is
 *                    extracted reliably; organization/location are
 *                    best-effort only.
 *
 * Because Dan pastes by hand, spacing between postings is inconsistent —
 * usually 2+ blank lines, sometimes zero, sometimes an extra blank line
 * appears mid-posting. This parser handles the common cases well but will
 * occasionally mis-split an unusually-formatted freeform posting. If your
 * volume of freeform postings grows and title-only accuracy isn't enough,
 * the more robust fix is routing "freeform" blocks through a small LLM
 * extraction call instead of more regex heuristics.
 */
export function parseDansListEmail(html: string): ParsedJob[] {
  const $ = cheerio.load(html);
  const paragraphs = $("p").toArray();

  const lines: Line[] = paragraphs.map((p) => {
    const $p = $(p);
    const text = cleanText($p.text());
    const links: Link[] = [];
    const mailtos: Link[] = [];
    $p.find("a").each((_, a) => {
      const href = $(a).attr("href") || "";
      const linkText = cleanText($(a).text());
      if (href.toLowerCase().startsWith("mailto:")) {
        mailtos.push({ href, text: linkText });
      } else if (href) {
        links.push({ href, text: linkText });
      }
    });
    return { text, links, mailtos };
  });

  // Split into blocks wherever there are 2+ consecutive blank paragraphs.
  // A single blank paragraph is just visual spacing between fields of the
  // SAME job (Dan's newsletter usually double/triple-blanks between jobs).
  const blocks: Line[][] = [];
  let current: Line[] = [];
  let blankRun = 0;
  for (const line of lines) {
    if (!line.text) {
      blankRun++;
      if (blankRun >= 2 && current.length) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    // Some postings run directly into the next with zero blank lines.
    // A standalone "Mon D, YYYY" line (e.g. "Jun 24, 2026") is a strong
    // signal of a fresh posting header — split the block right before its
    // preceding (title) line if that line looks like a short heading.
    if (DATE_LINE.test(line.text) && current.length >= 2) {
      const prev = current[current.length - 1];
      if (prev.text.length <= 70 && !/[.:;]$/.test(prev.text)) {
        current.pop();
        if (current.length) blocks.push(current);
        current = [prev, line];
        blankRun = 0;
        continue;
      }
    }
    blankRun = 0;
    current.push(line);
  }
  if (current.length) blocks.push(current);

  const jobs: (ParsedJob & { pattern: string })[] = [];

  for (const rawBlock of blocks) {
    if (rawBlock.length < 2) continue;
    if (NOISE.test(rawBlock[0].text)) continue;
    if (!/\p{L}{2,}/u.test(rawBlock[0].text)) continue; // title must contain real words
    const blockPreview = rawBlock.map((l) => l.text).join(" ").slice(0, 300);
    if (NOISE.test(blockPreview)) continue;

    // If a date line landed right after the title (from the boundary split
    // above), pull it out as posted_date rather than letting it occupy the
    // organization slot.
    let posted_date: string | null = null;
    const block = rawBlock.slice();
    if (block.length > 1 && DATE_LINE.test(block[1].text)) {
      posted_date = block[1].text;
      block.splice(1, 1);
    }

    const allLinks = block.flatMap((l) => l.links);
    const allMailtos = block.flatMap((l) => l.mailtos);
    if (allLinks.length === 0 && allMailtos.length === 0) continue;

    let apply_url = "";
    if (allLinks.length) {
      const last = allLinks[allLinks.length - 1];
      apply_url = isUrl(last.text) ? last.text : last.href;
    } else if (allMailtos.length) {
      apply_url = allMailtos[allMailtos.length - 1].href;
    }

    const title = block[0].text;
    const last = block[block.length - 1];
    const lastIsBareUrl =
      last.links.length > 0 && isUrl(last.links[0].text) && last.text === last.links[0].text;

    // Pattern 1: short listings — Title / Organization / Location / bare-URL
    if (block.length === 4 && lastIsBareUrl) {
      jobs.push({
        pattern: "short",
        title,
        organization: block[1].text,
        location: block[2].text,
        description: "",
        apply_url,
        source: "Dan's List",
        posted_date,
      });
      continue;
    }

    // Pattern 2: labeled fields — "Employer" / value, "Location" / value, etc.
    const fields: Record<string, string> = {};
    const consumed = new Set<number>([0]);
    for (let i = 1; i < block.length; i++) {
      const label = block[i].text.toLowerCase().replace(/:$/, "");
      if (LABELS.includes(label) && i + 1 < block.length) {
        const value = block[i + 1].text;
        if (value.length <= 150) {
          fields[label] = value;
          consumed.add(i);
          consumed.add(i + 1);
        }
      }
    }

    if (Object.keys(fields).length > 0) {
      const description = block
        .filter((_, i) => !consumed.has(i))
        .map((l) => l.text)
        .join("\n")
        .slice(0, 2000);
      jobs.push({
        pattern: "labeled",
        title,
        organization: fields["employer"] || "",
        location: fields["location"] || "",
        description,
        apply_url,
        source: "Dan's List",
        posted_date,
      });
      continue;
    }

    // Pattern 3: positional short-field header (Title / Org / Location /
    // salary / type, then a "Description" section) — common when Dan pastes
    // from job boards like NYFA. Org/location lines are short single
    // fields, unlike the prose that follows.
    if (block.length >= 3 && isShortLine(block[1]) && isShortLine(block[2])) {
      const description = block
        .slice(3)
        .map((l) => l.text)
        .join("\n")
        .slice(0, 2000);
      jobs.push({
        pattern: "positional",
        title,
        organization: block[1].text,
        location: block[2].text,
        description,
        apply_url,
        source: "Dan's List",
        posted_date,
      });
      continue;
    }

    // Pattern 4: free-form long posting — best effort only. Title is
    // reliable; organization often can't be reliably isolated from prose.
    const locationLine = block.find(
      (l) =>
        /^remote$/i.test(l.text) ||
        /^[A-Za-z .'-]+,\s*[A-Z]{2}$/.test(l.text) ||
        /^[A-Za-z .'-]+,\s*California$/i.test(l.text)
    );
    const description = block
      .slice(1)
      .map((l) => l.text)
      .join("\n")
      .slice(0, 2000);

    jobs.push({
      pattern: "freeform",
      title,
      organization: "",
      location: locationLine ? locationLine.text : "",
      description,
      apply_url,
      source: "Dan's List",
      posted_date,
    });
  }

  return jobs
    .filter((job) => job.apply_url && job.title.length >= 3 && job.title.length <= 150)
    .filter((job, index, self) => index === self.findIndex((j) => j.apply_url === job.apply_url))
    .map(({ pattern, ...job }) => job); // drop the internal debug field before returning
}
