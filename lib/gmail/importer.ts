import fs from "fs";
import { getGmailClient } from "./clients";
import { extractEmailBodies } from "./extractor";
import { parseIndeedHTML } from "../parsers/indeed-html";
import { parseIndeed } from "../parsers/indeed";
import { parseIdealist } from "../parsers/idealist";
import { parseDansListEmail } from "../parsers/parseDansListEmail";

function normTitle(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function importJobsFromGmail() {
  const gmail = await getGmailClient();

  const results = [];

  // Get ALL Indeed emails
  const indeedList = await gmail.users.messages.list({
    userId: "me",
    q: '(from:jobalert.indeed.com) (nonprofit OR "non profit" OR foundation OR philanthropy OR fundraising OR development OR charity) newer_than:30d',
    maxResults: 100,
  });
// Get ALL Dan's List emails
const dansList = await gmail.users.messages.list({
  userId: "me",
  q: 'from:dan@danslist.ccsend.com newer_than:90d',
  maxResults: 200,
});
  // Get ALL LinkedIn alerts
  const linkedinList = await gmail.users.messages.list({
    userId: "me",
    q: '(from:linkedin.com) (nonprofit OR "non profit" OR foundation OR philanthropy OR fundraising OR development OR charity) newer_than:30d',
    maxResults: 100,
  });

  // Get ALL Idealist emails
  const idealistList = await gmail.users.messages.list({
    userId: "me",
    q: '(from:idealist.org OR from:mail.idealist.org) (nonprofit OR "non profit" OR foundation OR philanthropy OR fundraising OR development OR charity) newer_than:30d',
    maxResults: 100,
  });

  // Merge them
  const allMessages = [
  ...(indeedList.data.messages || []),
  ...(linkedinList.data.messages || []),
  ...(idealistList.data.messages || []),
  ...(dansList.data.messages || []),
];

  console.log("Indeed emails:", indeedList.data.messages?.length || 0);
  console.log("LinkedIn emails:", linkedinList.data.messages?.length || 0);
  console.log("Idealist emails:", idealistList.data.messages?.length || 0);
  console.log("Dan's List emails:", dansList.data.messages?.length || 0);

  for (const message of allMessages) {
    const email = await gmail.users.messages.get({
      userId: "me",
      id: message.id!,
      format: "full",
    });

    const headers = email.data.payload?.headers || [];

    const subject = headers.find((h) => h.name === "Subject")?.value;
    const from = headers.find((h) => h.name === "From")?.value;

    const { textBody, htmlBody } = extractEmailBodies(email.data.payload);

    let jobs: any[] = [];

    // ------------------------
    // INDEED
    // ------------------------
    if (from?.toLowerCase().includes("indeed")) {
      // Parse jobs from the plain-text email
      jobs = parseIndeed(textBody || "");

      // Parse jobs (with URLs) from the HTML email
      const htmlJobs = parseIndeedHTML(htmlBody || "");

      console.log("TEXT JOBS:", jobs.length);
      console.log("HTML JOBS:", htmlJobs.length);

      // Build a lookup map from normalized title → html job
      const htmlByTitle = new Map<string, (typeof htmlJobs)[0]>();
      for (const hj of htmlJobs) {
        const key = normTitle(hj.title);
        if (key) htmlByTitle.set(key, hj);
      }

      // Match each text job to its HTML counterpart by title
      for (const job of jobs) {
        const key = normTitle(job.title);
        const match = htmlByTitle.get(key);
        if (match) {
          job.apply_url = match.apply_url;
          job.source_url = match.source_url;
        } else {
          // Fallback: fuzzy — find html job whose title contains or is contained by this title
          for (const [hKey, hJob] of htmlByTitle) {
            if (hKey.includes(key) || key.includes(hKey)) {
              job.apply_url = hJob.apply_url;
              job.source_url = hJob.source_url;
              break;
            }
          }
        }
      }

      console.log("FIRST JOB");
      console.log(jobs[0]);
    }

    // ------------------------
    // IDEALIST
    // ------------------------
    else if (
      from?.toLowerCase().includes("idealist") ||
      from?.toLowerCase().includes("mail.idealist.org")
    ) {
      jobs = parseIdealist(htmlBody || "");
    }
    // ------------------------
// DAN'S LIST
// ------------------------
else if (
  from?.toLowerCase().includes("danslist") ||
  from?.toLowerCase().includes("ccsend.com")
) {
  jobs = parseDansListEmail(htmlBody || "");

  console.log("=================================");
  console.log("DAN'S LIST EMAIL");
  console.log("Subject:", subject);
  console.log("Jobs found:", jobs.length);

  if (jobs.length > 0) {
    console.log("FIRST JOB");
    console.log(JSON.stringify(jobs[0], null, 2));
  }

  console.log("=================================");
}
    results.push({
      subject,
      from,
      jobs,
    });
  }

  return results;
}
