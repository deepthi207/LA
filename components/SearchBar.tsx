"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(
    params.get("search") || ""
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const query = new URLSearchParams();

    if (search) {
      query.set("search", search);
    }

    router.push("/?" + query.toString());
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 flex gap-3"
    >
      <input
        className="flex-1 rounded-lg border px-4 py-3"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        className="rounded-lg bg-green-700 px-6 py-3 text-white"
      >
        Search
      </button>
    </form>
  );
}