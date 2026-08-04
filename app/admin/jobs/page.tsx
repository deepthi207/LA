
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminJobs() {
  const { data: jobs, error } = await supabaseAdmin
    .from("job_submissions")
    .select("*")
    .order("created_at", { ascending: false });
    console.log(jobs);
    console.log(error);
    
  return (
    <main className="max-w-6xl mx-auto py-12">

      <h1 className="text-4xl font-bold mb-8">
        Pending Job Submissions
      </h1>

      <div className="space-y-6">

        {jobs?.map((job) => (

          <div
            key={job.id}
            className="border rounded-xl p-6 bg-white shadow"
          >

            <h2 className="text-2xl font-bold">
              {job.title}
            </h2>

            <p className="text-green-700 font-semibold">
              {job.organization}
            </p>

            <p className="mt-4">
              {job.location}
            </p>

            <p className="mt-4">
              {job.salary}
            </p>

            <div className="mt-6 flex gap-3">

              <a
                href={`/admin/jobs/${job.id}`}
                className="bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Review
              </a>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}
