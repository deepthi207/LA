import { JobFormState } from "./types";

type Props = {
  form: JobFormState;
};

export default function JobPreview({ form }: Props) {
  return (
    <div className="rounded-2xl border bg-stone-50 p-8">

      <h2 className="mb-6 text-2xl font-bold">
        Live Preview
      </h2>

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <h3 className="text-3xl font-bold">
          {form.title || "Job Title"}
        </h3>

        <p className="mt-2 text-xl font-semibold text-green-700">
          {form.organization || "Organization"}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">

          {form.location && (
            <span className="rounded-full bg-gray-100 px-4 py-2">
              📍 {form.location}
            </span>
          )}

          {form.employment_type && (
            <span className="rounded-full bg-gray-100 px-4 py-2">
              💼 {form.employment_type}
            </span>
          )}

          {form.salary && (
            <span className="rounded-full bg-green-100 px-4 py-2 text-green-700">
              💲 {form.salary}
            </span>
          )}

        </div>

        <div className="mt-8 whitespace-pre-wrap leading-7 text-gray-700">

          {form.description ||
            "Job description preview will appear here."}

        </div>

        <div className="mt-8">

          {form.apply_method === "url" ? (

            form.apply_url ? (

              <a
                href={form.apply_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
              >
                Apply Now
              </a>

            ) : (

              <button
                disabled
                className="rounded-lg bg-gray-300 px-6 py-3 text-gray-600"
              >
                Apply Now
              </button>

            )

          ) : (

            <div className="rounded-lg border bg-blue-50 p-4">

              <div className="font-semibold">
                Apply by Email
              </div>

              <div className="mt-2 text-blue-700">

                {form.apply_email ||
                  "No application email provided."}

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}