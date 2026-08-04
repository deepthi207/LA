"use client";

import { useState } from "react";

const SOURCES = [
  "Indeed",
  "Idealist",
  "LA2050",
  "Greenhouse",
  "Envision",
  "LinkedIn",
];

const DEFAULT_KEYWORDS = [
  "Development",
  "Fundraising",
  "Communications",
  "Operations",
  "Director",
  "Manager",
  "Coordinator",
  "Finance",
];

export default function JobsDigest() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [sources, setSources] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function toggleSource(source: string) {
    setSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  }

  function toggleKeyword(keyword: string) {
    setKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  }

  function addKeyword() {
    if (!customKeyword.trim()) return;

    if (!keywords.includes(customKeyword.trim())) {
      setKeywords([...keywords, customKeyword.trim()]);
    }

    setCustomKeyword("");
  }

  async function subscribe() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        frequency,
        keywords,
        sources,
        locations: [],
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("✅ You're subscribed!");
      setEmail("");
    } else {
      setMessage("❌ Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <div className="sticky top-6 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">
        Jobs Digest
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Get matching nonprofit jobs delivered to your inbox.
      </p>

      <input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border p-3 mb-6"
      />

      <h3 className="font-semibold mb-2">Frequency</h3>

      <div className="flex gap-2 mb-6">
        {["Daily", "Weekly", "Monthly"].map((f) => (
          <button
            key={f}
            onClick={() => setFrequency(f)}
            className={`rounded-full px-4 py-2 ${
              frequency === f
                ? "bg-green-700 text-white"
                : "bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <h3 className="font-semibold mb-2">Sources</h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {SOURCES.map((source) => (
          <button
            key={source}
            onClick={() => toggleSource(source)}
            className={`rounded-full px-3 py-1 text-sm ${
              sources.includes(source)
                ? "bg-green-700 text-white"
                : "bg-gray-100"
            }`}
          >
            {source}
          </button>
        ))}
      </div>

      <h3 className="font-semibold mb-2">Keywords</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {DEFAULT_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            onClick={() => toggleKeyword(keyword)}
            className={`rounded-full px-3 py-1 text-sm ${
              keywords.includes(keyword)
                ? "bg-green-700 text-white"
                : "bg-gray-100"
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={customKeyword}
          onChange={(e) => setCustomKeyword(e.target.value)}
          placeholder="Custom keyword..."
          className="flex-1 rounded-lg border p-2"
        />

        <button
          onClick={addKeyword}
          className="rounded-lg border px-4"
        >
          Add
        </button>
      </div>

      <button
        onClick={subscribe}
        disabled={loading}
        className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white"
      >
        {loading ? "Subscribing..." : "Subscribe to Digest"}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm">
          {message}
        </p>
      )}
    </div>
  );
}