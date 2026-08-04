import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="font-semibold text-green-700">
          ← Back to Jobs
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-3xl border bg-white p-10 shadow-sm">
            <h1 className="text-5xl font-bold leading-tight">
              {job.title}
            </h1>

            <p className="mt-4 text-2xl font-semibold text-green-700">
              {job.organization}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {job.location && (
                <span className="rounded-full bg-stone-100 px-4 py-2">
                  <MapPin className="mr-2 inline h-4 w-4" />
                  {job.location}
                </span>
              )}

              {job.source && (
                <span className="rounded-full bg-blue-100 px-4 py-2 text-blue-700">
                  {job.source}
                </span>
              )}

              {job.employment_type && (
                <span className="rounded-full bg-purple-100 px-4 py-2 text-purple-700">
                  <Briefcase className="mr-2 inline h-4 w-4" />
                  {job.employment_type}
                </span>
              )}

              {(job.salary_min || job.salary_max || job.salary) && (
                <span className="rounded-full bg-green-100 px-4 py-2 text-green-700">
                  <DollarSign className="mr-2 inline h-4 w-4" />
                  {job.salary ||
                    `$${job.salary_min ?? ""}${job.salary_max ? ` - $${job.salary_max}` : ""}`}
                </span>
              )}

              {job.posted_date && (
                <span className="rounded-full bg-stone-100 px-4 py-2">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Posted {job.posted_date}
                </span>
              )}
            </div>

            <div className="mt-10 border-t pt-10">
              <h2 className="text-3xl font-bold">Job Description</h2>

              <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-stone-700">
                {job.description || "No description provided yet."}
              </div>
            </div>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-8 self-start">

  {/* Apply Card */}
  <div className="rounded-3xl border bg-white p-6 shadow-sm">

    <h2 className="text-2xl font-bold">
      Ready to Apply?
    </h2>

    <p className="mt-3 text-sm text-stone-600">
      Apply directly through the official job posting.
    </p>

    {job.apply_url ? (
      <a
        href={job.apply_url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-4 font-semibold text-white hover:bg-green-800"
      >
        Apply Now
        <ArrowUpRight className="h-5 w-5" />
      </a>
    ) : (
      <p className="mt-4 text-stone-500">
        No application link available.
      </p>
    )}

    <button className="mt-3 w-full rounded-xl border px-6 py-3 font-semibold hover:bg-stone-50">
      Save Job
    </button>

    <button className="mt-3 w-full rounded-xl border px-6 py-3 font-semibold hover:bg-stone-50">
      Share Job
    </button>

  </div>

  {/* Job Summary */}
  <div className="rounded-3xl border bg-white p-6 shadow-sm">

    <h2 className="text-2xl font-bold">
      Job Summary
    </h2>

    <div className="mt-6 space-y-4">

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-500">
          Organization
        </p>
        <p className="font-bold">
          {job.organization || "Not provided"}
        </p>
      </div>

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-500">
          Location
        </p>
        <p className="font-bold">
          {job.location || "Not provided"}
        </p>
      </div>

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-500">
          Source
        </p>
        <p className="font-bold">
          {job.source || "Not provided"}
        </p>
      </div>

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-500">
          Category
        </p>
        <p className="font-bold">
          {job.category || "Not provided"}
        </p>
      </div>

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-500">
          Seniority
        </p>
        <p className="font-bold">
          {job.seniority_level || "Not provided"}
        </p>
      </div>

    </div>

  </div>

</aside>

</div>

</div>

</main>
);
}