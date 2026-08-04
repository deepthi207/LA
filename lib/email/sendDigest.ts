import { Resend } from "resend";

export async function sendDigest(
  email: string,
  jobs: any[]
) {
  if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "LA Nonprofit Jobs <jobs@yourdomain.com>",
    to: email,
    subject: "Your Weekly Nonprofit Jobs",
    html: "...",
  });
}
