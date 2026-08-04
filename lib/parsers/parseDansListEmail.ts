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
  "organization",
  "company",
  "location",
  "salary",
  "employment type",
  "closing date",
  "deadline",
  "deadline to apply",
];

const NOISE =
  /(unsubscribe|update profile|constant contact|dans-?list.*disclaimer|i send out these jobs|coming soon|my guidelines|have a friend or colleague|my best,|dan rothblatt|6505 wilshire|los angeles, ca 90048)/i;

const DATE_LINE = /^[A-Z][a-z]{2,8}\s+\d{1,2},\s*\d{4}$/;

const LOCATION_RE =
  /^(remote|hybrid|los angeles|los angeles,\s*ca|los angeles,\s*california|long beach,\s*ca|pasadena,\s*ca|santa monica,\s*ca|west hollywood,\s*ca|culver city,\s*ca|glendale,\s*ca|burbank,\s*ca|[A-Za-z .'-]+,\s*(CA|NY|TX|WA|OR|AZ|NV|FL|IL|DC))$/i;

const TITLE_WORDS =
  /(director|manager|coordinator|officer|associate|assistant|executive|president|chief|lead|specialist|administrator|analyst|writer|editor|teacher|counselor|development|fundraising|grants|program|communications|marketing|operations|finance|philanthropy|account executive)/i;

function cleanText(raw: string): string {
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

function cleanUrl(url: string): string {
  return url.replace(/[),.]+$/g, "").trim();
}

function isLabel(text: string): boolean {
  return LABELS.includes(text.toLowerCase().replace(/:$/, "").trim());
}

function isLikelyTitle(text: string): boolean {
  const t = cleanText(text);

  if (!t) return false;
  if (t.length < 3 || t.length > 150) return false;
  if (NOISE.test(t)) return false;
  if (isUrl(t)) return false;
  if (isLabel(t)) return false;
  if (DATE_LINE.test(t)) return false;
  if (LOCATION_RE.test(t)) return false;
  if (/^(summary|description|about this job|about this organization|how to apply|to apply)$/i.test(t)) return false;
  if (/[.!?]$/.test(t) && t.length > 70) return false;

  return TITLE_WORDS.test(t) || /^[A-Z][A-Za-z/&()'’.\- ]{3,80}$/.test(t);
}

function isShortLine(line: Line): boolean {
  return line.text.length <= 90 && !/[.]\s.+[.]/.test(line.text);
}

function extractTitle(block: Line[]): { title: string; startIndex: number } {
  let title = block[0].text;
  let startIndex = 1;

  for (let i = 1; i < Math.min(block.length, 3); i++) {
    const next = block[i].text;

    if (!next) break;
    if (isLabel(next)) break;
    if (DATE_LINE.test(next)) break;
    if (LOCATION_RE.test(next)) break;
    if (isUrl(next)) break;
    if (next.length > 70) break;
    if (/[.:;]$/.test(next)) break;

    if (TITLE_WORDS.test(title + " " + next)) {
      title = `${title} ${next}`;
      startIndex = i + 1;
    } else {
      break;
    }
  }

  return {
    title: cleanText(title),
    startIndex,
  };
}

function findLocation(block: Line[]): string {
  const found = block.find((line) => LOCATION_RE.test(line.text));
  return found?.text || "";
}

function findBestApplyUrl(block: Line[]): string {
  const allLinks = block.flatMap((line) => line.links);
  const allMailtos = block.flatMap((line) => line.mailtos);

  const goodLinks = allLinks.filter((link) => {
    const href = link.href.toLowerCase();
    return (
      href &&
      !href.includes("constantcontact") &&
      !href.includes("visitor.constantcontact") &&
      !href.includes("unsubscribe") &&
      !href.includes("dans-list.org")
    );
  });

  if (goodLinks.length > 0) {
    const last = goodLinks[goodLinks.length - 1];
    return cleanUrl(isUrl(last.text) ? last.text : last.href);
  }

  if (allLinks.length > 0) {
    const last = allLinks[allLinks.length - 1];
    return cleanUrl(isUrl(last.text) ? last.text : last.href);
  }

  if (allMailtos.length > 0) {
    return allMailtos[allMailtos.length - 1].href;
  }

  return "";
}

function guessOrganization(block: Line[], title: string, startIndex: number): string {
  for (let i = startIndex; i < Math.min(block.length, startIndex + 6); i++) {
    const label = block[i].text.toLowerCase().replace(/:$/, "");
    if (["employer", "organization", "company"].includes(label) && block[i + 1]) {
      return block[i + 1].text;
    }
  }

  const firstUrlLine = block.find((line) => line.links.length > 0 && !isUrl(line.text));
  if (firstUrlLine && firstUrlLine.text.length <= 120 && !isLikelyTitle(firstUrlLine.text)) {
    return firstUrlLine.text;
  }

  const possible = block[startIndex];

  if (
    possible &&
    possible.text.length <= 100 &&
    !isLabel(possible.text) &&
    !LOCATION_RE.test(possible.text) &&
    !isUrl(possible.text) &&
    !/salary/i.test(possible.text) &&
    possible.text !== title
  ) {
    return possible.text.replace(/,$/, "");
  }

  return "";
}

function extractFields(block: Line[], startIndex: number) {
  const fields: Record<string, string> = {};
  const consumed = new Set<number>();

  for (let i = startIndex; i < block.length; i++) {
    const label = block[i].text.toLowerCase().replace(/:$/, "").trim();

    if (LABELS.includes(label) && i + 1 < block.length) {
      const value = block[i + 1].text;

      if (value && value.length <= 200) {
        fields[label] = value;
        consumed.add(i);
        consumed.add(i + 1);
      }
    }
  }

  return { fields, consumed };
}

function buildDescription(block: Line[], skip: Set<number>, startIndex: number): string {
  return block
    .filter((_, index) => index >= startIndex && !skip.has(index))
    .map((line) => line.text)
    .filter(Boolean)
    .join("\n")
    .slice(0, 2500);
}
function cleanupJob(job: ParsedJob): ParsedJob {
  // Remove URLs accidentally appended to titles
  job.title = job.title
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Remove trailing colons
  job.title = job.title.replace(/[:\-–]+$/, "").trim();

  // Remove duplicate spaces
  job.organization = job.organization.replace(/\s+/g, " ").trim();

  // Remove bogus organizations
  // Remove bogus organizations
if (
  /^https?:/i.test(job.organization) ||
  /^apply now$/i.test(job.organization) ||
  /^about the role$/i.test(job.organization) ||
  /^learn more$/i.test(job.organization) ||
  /^salary/i.test(job.organization) ||
  /^compensation/i.test(job.organization) ||
  job.organization.length > 120
) {
  job.organization = "";
}
  // Remove fake locations
if (
  /^salary/i.test(job.location) ||
  /^compensation/i.test(job.location) ||
  /^full time/i.test(job.location) ||
  /^about the role$/i.test(job.location)
) {
  job.location = "";
}

  // Clean location
  job.location = job.location
    .replace(/\s+/g, " ")
    .replace(/^Location:?/i, "")
    .trim();

  // Ignore fake locations
  if (
    job.location.length > 80 ||
    /^https?:/i.test(job.location)
  ) {
    job.location = "";
  }

  return job;
}
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

      if (!href) return;

      if (href.toLowerCase().startsWith("mailto:")) {
        mailtos.push({ href, text: linkText });
      } else {
        links.push({ href, text: linkText });
      }
    });

    return { text, links, mailtos };
  });

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

    if (NOISE.test(line.text)) {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
      blankRun = 0;
      continue;
    }

    if (DATE_LINE.test(line.text) && current.length >= 2) {
      const prev = current[current.length - 1];

      if (prev.text.length <= 80 && !/[.:;]$/.test(prev.text)) {
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

  const jobs: ParsedJob[] = [];

  for (const rawBlock of blocks) {
    if (rawBlock.length < 2) continue;

    const preview = rawBlock.map((line) => line.text).join(" ").slice(0, 400);
    if (NOISE.test(preview)) continue;

    const block = rawBlock.slice();

    let posted_date: string | null = null;

    if (block.length > 1 && DATE_LINE.test(block[1].text)) {
      posted_date = block[1].text;
      block.splice(1, 1);
    }

    const { title, startIndex } = extractTitle(block);

    if (!isLikelyTitle(title)) continue;

if (
    title.includes("https://") ||
    title.includes("http://") ||
    title.length > 120 ||
    /^full.?timeprofessional$/i.test(title) ||
    /^professional$/i.test(title) ||
    /^apply now$/i.test(title) ||
    /^about the role$/i.test(title) ||
    /^learn more$/i.test(title) ||
    /^click here$/i.test(title) ||
    /^salary/i.test(title) ||
    /^compensation/i.test(title)
) {
    continue;
}

    const apply_url = findBestApplyUrl(block);
    if (!apply_url) continue;

    const last = block[block.length - 1];
    const lastIsBareUrl =
      last.links.length > 0 &&
      isUrl(last.links[0].text) &&
      last.text === last.links[0].text;

    const { fields, consumed } = extractFields(block, startIndex);

    let organization =
      fields["employer"] ||
      fields["organization"] ||
      fields["company"] ||
      "";

    let location = fields["location"] || "";

    let description = "";

    if (Object.keys(fields).length > 0) {
      const skip = new Set<number>([0]);
      for (let i = 1; i < startIndex; i++) skip.add(i);
      consumed.forEach((i) => skip.add(i));

      if (!organization) organization = guessOrganization(block, title, startIndex);
      if (!location) location = findLocation(block);

      description = buildDescription(block, skip, startIndex);
    } else if (block.length === 4 && lastIsBareUrl) {
      organization = block[1].text;
      location = block[2].text;
      description = "";
    } else if (
      block.length >= 3 &&
      isShortLine(block[1]) &&
      isShortLine(block[2]) &&
      !LOCATION_RE.test(block[1].text)
    ) {
      organization = block[1].text;
      location = LOCATION_RE.test(block[2].text) ? block[2].text : findLocation(block);

      description = block
        .slice(3)
        .map((line) => line.text)
        .filter(Boolean)
        .join("\n")
        .slice(0, 2500);
    } else {
      organization = guessOrganization(block, title, startIndex);
      location = findLocation(block);

      description = block
        .slice(startIndex)
        .map((line) => line.text)
        .filter(Boolean)
        .join("\n")
        .slice(0, 2500);
    }
    if (!organization) {

    const next = block.find(
        l =>
            l.text.length < 80 &&
            !LOCATION_RE.test(l.text) &&
            !isUrl(l.text) &&
            !TITLE_WORDS.test(l.text)
    );

    if (next) organization = next.text;
}
    jobs.push({
      title,
      organization,
      location,
      description,
      apply_url,
      source: "Dan's List",
      posted_date,
    });
  }

  const seen = new Set<string>();

  return jobs
.map(cleanupJob)
.filter((job) => {

    if (!job.organization && !job.location) {
        return false;
    }

    if (job.title.split(" ").length < 2) {
        return false;
    }

    if (
        /^apply now$/i.test(job.title) ||
        /^about the role$/i.test(job.title)
    ) {
        return false;
    }
 if (!job.apply_url) return false;
    if (!job.title || job.title.length < 3 || job.title.length > 150) return false;
    if (NOISE.test(job.title)) return false;

    const key = `${job.title}-${job.organization}-${job.apply_url}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}
