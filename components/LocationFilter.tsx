"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LocationFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const currentLocation = params.get("location") || "";

  function changeLocation(location: string) {
    const query = new URLSearchParams(params.toString());

    if (location) {
      query.set("location", location);
    } else {
      query.delete("location");
    }

    router.push("/?" + query.toString());
  }

  const locations = [
    "Los Angeles",
    "Pasadena",
    "Santa Clarita",
    "Irwindale",
    "Remote",
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        onClick={() => changeLocation("")}
        className={`rounded-lg border px-4 py-2 ${
          currentLocation === "" ? "bg-green-700 text-white" : "bg-white"
        }`}
      >
        All Locations
      </button>

      {locations.map((location) => (
        <button
          key={location}
          onClick={() => changeLocation(location)}
          className={`rounded-lg border px-4 py-2 ${
            currentLocation === location
              ? "bg-green-700 text-white"
              : "bg-white"
          }`}
        >
          {location}
        </button>
      ))}
    </div>
  );
}