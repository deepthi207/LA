# Los Angeles Nonprofit Jobs

A production-ready Next.js 16 job board backed by Supabase. It includes public job search and filters, individual job pages, browser-based saved jobs, employer submissions, admin review/publishing, email-digest subscriptions, and optional Gmail/job-source importers.

## 1. Create the database

1. Create a Supabase project.
2. Open **SQL Editor** in Supabase.
3. Paste and run `supabase/migrations/001_initial_schema.sql`.
4. In **Project Settings → API**, copy the project URL, anon key, and service-role key.

The SQL enables Row Level Security. Anonymous visitors can read only active, non-expired jobs. Submissions, subscriber details, Gmail tokens, and administrative data remain private and are written only through server routes.

## 2. Configure the app

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_LONG_RANDOM_PASSWORD
CRON_SECRET=YOUR_OTHER_LONG_RANDOM_SECRET
```

Never expose the service-role key or commit `.env.local`.

## 3. Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Admin review is at `http://localhost:3000/admin/jobs`; the browser will request the admin username and password.

## 4. Deploy to Vercel

1. Push this folder to GitHub and import the repository in Vercel.
2. Add the same environment variables in **Vercel → Project Settings → Environment Variables**.
3. Deploy.
4. Add your custom domain in **Vercel → Domains**.

The included cron runs the Gmail importer at 8:00 AM Pacific during daylight saving time (15:00 UTC). Configure the optional Google variables before enabling it.

## Optional Gmail and email digest setup

For Gmail imports, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`, and configure the OAuth redirect URI to `https://YOUR_DOMAIN/api/oauth2callback`. For outgoing digests, add `RESEND_API_KEY` and a verified `EMAIL_FROM` address.

## Main database tables

- `jobs`: published listings shown publicly
- `job_submissions`: employer submissions awaiting review
- `email_subscriptions`: digest preferences
- `organizations`: discovery/import pipeline organizations
- `gmail_tokens`: private OAuth tokens
- `processed_emails`: imported-message deduplication

## Useful routes

- `/` — searchable job board
- `/jobs/[id]` — job details
- `/post-job` — employer submission form
- `/admin/jobs` — protected review queue
- `/api/subscribe` — email-digest signup
- `/api/gmail/import` — optional scheduled Gmail import

## Verification

```bash
npm run lint
npm run build
```
