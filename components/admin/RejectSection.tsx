type Props = {
  rejectReason: string;
  setRejectReason: (value: string) => void;
};

const templates = [
  "Missing application link.",
  "Incomplete job description.",
  "Organization could not be verified.",
  "Duplicate job posting.",
  "Position appears to be expired.",
];

export default function RejectSection({
  rejectReason,
  setRejectReason,
}: Props) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

      <h2 className="text-xl font-bold text-red-700">
        Reject Submission
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        This reason can be emailed to the employer.
      </p>

      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        rows={5}
        placeholder="Explain why this submission is being rejected..."
        className="mt-4 w-full rounded-lg border p-3"
      />

      <div className="mt-6">

        <p className="mb-3 font-semibold">
          Quick Templates
        </p>

        <div className="flex flex-wrap gap-2">

          {templates.map((template) => (

            <button
              key={template}
              type="button"
              onClick={() => setRejectReason(template)}
              className="rounded-full border bg-white px-4 py-2 text-sm hover:bg-red-100"
            >
              {template}
            </button>

          ))}

        </div>

      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">

        <p className="font-semibold">
          Email Preview
        </p>

        <div className="mt-3 text-sm whitespace-pre-wrap text-gray-700">

{`Hello,

Thank you for submitting your job posting.

Unfortunately we cannot publish this posting at this time.

Reason:

${rejectReason || "No reason provided."}

Please update your posting and submit it again.

Thank you,
Los Angeles Nonprofit Jobs`}

        </div>

      </div>

    </div>
  );
}