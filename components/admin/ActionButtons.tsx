type Props = {
  loading: boolean;
  onSave: () => void;
  onApprove: () => void;
  onReject: () => void;
};
export default function ActionButtons({
  loading,
  onSave,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold">
        Actions
      </h2>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={onSave}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>

        <button
          onClick={onApprove}
          disabled={loading}
          className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Publishing..." : "✅ Approve & Publish"}
        </button>

        <button
          onClick={onReject}
          disabled={loading}
          className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Rejecting..." : "❌ Reject"}
        </button>
      </div>

      <div className="mt-6 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">

        <p className="font-semibold">
          Publishing Checklist
        </p>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Review job title</li>
          <li>Verify organization name</li>
          <li>Check apply link or email</li>
          <li>Verify salary if available</li>
          <li>Proofread description</li>
        </ul>

      </div>

    </div>
  );
}
