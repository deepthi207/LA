export function parseIndeed(text: string) {
  const jobs: any[] = [];

  text = text.replace(/\r/g, "");

  const start = text.indexOf("These job ads match your saved job alert");
  if (start !== -1) {
    text = text.substring(start);
  }

  const end = text.indexOf("View all jobs");
  if (end !== -1) {
    text = text.substring(0, end);
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (
      line.includes("These job ads match") ||
      line.includes("new nonprofit jobs") ||
      line.includes("new director") ||
      line.includes("new executive") ||
      line.includes("Indeed homepage")
    ) {
      i++;
      continue;
    }

    const title = line;

    if (
      title.length < 5 ||
      title.length > 120 ||
      title.startsWith("$") ||
      title.startsWith("View") ||
      title.startsWith("Edit") ||
      title.startsWith("Do not") ||
      title.startsWith("Privacy") ||
      title.startsWith("Terms") ||
      title.startsWith("Manage") ||
      title.startsWith("Unsubscribe")
    ) {
      i++;
      continue;
    }

    let organization = "";
    let location = "";
    let salary = "";
    let description = "";

    i++;

    while (i < lines.length) {
      const current = lines[i];

      if (
        current === "Just posted" ||
        /^\d+\s+day/.test(current) ||
        /^\d+\s+days/.test(current)
      ) {
        i++;
        break;
      }

      if (current.includes("out of 5")) {
        i++;
        continue;
      }

      if (current === "Easily apply") {
        i++;
        continue;
      }

      if (
        !organization &&
        !current.includes(", CA") &&
        !current.includes("$")
      ) {
        organization = current;
        i++;
        continue;
      }

      if (!location && current.includes(", CA")) {
        location = current;
        i++;
        continue;
      }

      if (!salary && current.includes("$")) {
        salary = current;
        i++;
        continue;
      }

      description += current + " ";
      i++;
    }

    if (
      !title ||
      !organization ||
      title.startsWith("©") ||
      title.startsWith("Indeed") ||
      title.startsWith("Your job alert") ||
      title.startsWith("View all") ||
      title.startsWith("Edit this") ||
      title.startsWith("Do not share") ||
      title.startsWith("Manage job alerts") ||
      title.startsWith("Privacy") ||
      title.startsWith("Terms") ||
      title.startsWith("Help Center") ||
      title.startsWith("Page ") ||
      title.includes("unsubscribe") ||
      title.includes("resume on Indeed")
    ) {
      continue;
    }

    if (
      title.startsWith("Reporting to") ||
      title.startsWith("Partner with") ||
      title.startsWith("Lead the") ||
      title.startsWith("Provide") ||
      title.startsWith("The incumbent") ||
      title.startsWith("The mission") ||
      title.startsWith("Final salary")
    ) {
      continue;
    }

    if (organization.includes(", CA")) {
      continue;
    }

    jobs.push({
      title,
      organization,
      location,
      salary,
      description: description.trim(),
      apply_url: "",   // filled in by importer after HTML merge
      source_url: "",  // filled in by importer after HTML merge
      source: "Indeed",
    });
  }

  console.log("Indeed jobs parsed:", jobs.length);

  return jobs;
}