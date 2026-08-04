"use client";

import { useSavedJobs } from "@/providers/SavedJobsProvider";

export default function MyJobs() {
  const {
    savedJobs,
    clearJobs,
    count,
  } = useSavedJobs();

  async function copyJobs() {
    const text = savedJobs
      .map(
        (job) =>
`${job.title}
${job.organization}
${job.location}

${job.apply_url || ""}
`
      )
      .join("\n------------------\n");

    await navigator.clipboard.writeText(text);

    alert("Jobs copied to clipboard.");
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm sticky top-6">

      <h2 className="text-2xl font-bold">
        ❤️ My Jobs
      </h2>

      <p className="mt-2 text-gray-500">
        {count} Saved Jobs
      </p>

      <div className="mt-6 space-y-4">

        {savedJobs.length === 0 ? (

          <p className="text-gray-400">
            No saved jobs yet.
          </p>

        ) : (

          savedJobs.map((job) => (

            <div
              key={job.id}
              className="rounded-lg border p-4"
            >

              <h3 className="font-semibold">
                {job.title}
              </h3>

              <p className="text-sm text-green-700">
                {job.organization}
              </p>

              <p className="text-sm text-gray-500">
                {job.location}
              </p>

            </div>

          ))

        )}

      </div>

      {savedJobs.length > 0 && (

        <div className="mt-8 space-y-3">

          <button
            onClick={copyJobs}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white"
          >
            📋 Copy Jobs
          </button>

          <button
            onClick={clearJobs}
            className="w-full rounded-lg border px-4 py-3"
          >
            Clear All
          </button>

        </div>

      )}

    </div>
  );
}