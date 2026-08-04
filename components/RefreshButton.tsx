"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const secret = window.prompt(
      "Enter the CRON_SECRET from Vercel:"
    );

    if (!secret) return;

    setLoading(true);

    try {
      const response = await fetch("/api/refresh-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Refresh failed");
      }

      const message = result.sources
        .map((source: any) => {
          if (!source.success) {
            return `${source.source}: Failed`;
          }

          const data = source.result;

          const saved =
            data.saved ??
            data.summary?.saved ??
            0;

          return `${source.source}: ${saved} saved`;
        })
        .join("\n");

      window.alert(message);
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Refresh failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Refreshing..." : "Refresh Jobs"}
    </button>
  );
}
