export function decodeBase64(data: string) {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
}

export function extractEmailBodies(payload: any) {
  let textBody = "";
  let htmlBody = "";

  function walk(parts: any[]) {
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        textBody = decodeBase64(part.body.data);
      }

      if (part.mimeType === "text/html" && part.body?.data) {
        htmlBody = decodeBase64(part.body.data);
      }

      if (part.parts) {
        walk(part.parts);
      }
    }
  }

  if (payload.parts) {
    walk(payload.parts);
  }

  if (!textBody && payload.body?.data) {
    textBody = decodeBase64(payload.body.data);
  }

  return {
    textBody,
    htmlBody,
  };
}