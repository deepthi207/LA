"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SourceFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const currentSource = params.get("source") || "";

  function changeSource(source: string) {
    const query = new URLSearchParams(params.toString());

    if (source) {
      query.set("source", source);
    } else {
      query.delete("source");
    }

    router.push("/?" + query.toString());
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={() => changeSource("")}
        className={`rounded-lg border px-4 py-2 ${
          currentSource === ""
            ? "bg-green-700 text-white"
            : "bg-white"
        }`}
      >
        All
      </button>

      <button
        onClick={() => changeSource("Indeed")}
        className={`rounded-lg border px-4 py-2 ${
          currentSource === "Indeed"
            ? "bg-green-700 text-white"
            : "bg-white"
        }`}
      >
        Indeed
      </button>

      <button
  onClick={() => changeSource("Dan's List")}
  className={`rounded-lg border px-4 py-2 ${
    currentSource === "Dan's List"
      ? "bg-green-700 text-white"
      : "bg-white"
  }`}
>
  Dan&apos;s List
</button>

      <button
        onClick={() => changeSource("Idealist")}
        className={`rounded-lg border px-4 py-2 ${
          currentSource === "Idealist"
            ? "bg-green-700 text-white"
            : "bg-white"
        }`}
      >
        Idealist
      </button>

      <button
        onClick={() => changeSource("LA2050")}
        className={`rounded-lg border px-4 py-2 ${
          currentSource === "LA2050"
            ? "bg-green-700 text-white"
            : "bg-white"
        }`}
      >
        LA2050
      </button>

      <button
        onClick={() => changeSource("Greenhouse")}
        className={`rounded-lg border px-4 py-2 ${
          currentSource === "Greenhouse"
            ? "bg-green-700 text-white"
            : "bg-white"
        }`}
      >
        Greenhouse
      </button>
      <button
  onClick={() => changeSource("Other")}
  className={`rounded-lg border px-4 py-2 ${
    currentSource === "Other"
      ? "bg-green-700 text-white"
      : "bg-white"
  }`}
>
  Other
</button>

      
    </div>
  );
}
