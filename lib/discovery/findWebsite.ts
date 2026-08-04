import axios from "axios";

function cleanWebsite(url: string | null): string | null {
  if (!url) return null;

  if (url.includes("google.com/maps")) return null;
  if (url.startsWith("mailto:")) return null;
  if (url.startsWith("tel:")) return null;

  return url;
}

export async function findWebsiteFromSearchResult(
  name: string,
  existingWebsite?: string | null
) {
  const cleaned = cleanWebsite(existingWebsite || null);

  if (cleaned) {
    return cleaned;
  }

  return null;
}