"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);

    await fetch("/api/process-all");

    router.refresh();

    setLoading(false);
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white"
    >
      {loading ? "Refreshing..." : "Refresh Jobs"}
    </button>
  );
}