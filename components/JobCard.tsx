"use client";

import Link from "next/link";
import { useSavedJobs } from "@/providers/SavedJobsProvider";
import {
Bookmark,
ArrowUpRight,
MapPin,
Clock
} from "lucide-react";
type JobCardProps = {
  id: number;
  title: string;
  organization: string;
  location: string;
  salary?: string;
  apply_url?: string;
  source?: string;
  posted_date?: string;
};
const sourceColors = {
  Indeed: "bg-orange-100 text-orange-700",
  Idealist: "bg-blue-100 text-blue-700",
  Greenhouse: "bg-emerald-100 text-emerald-700",
  LinkedIn: "bg-sky-100 text-sky-700",
  "Dan's List"
  : "bg-pink-100 text-pink-700",
  Others: "bg-indigo-100 text-indigo-700",
  LA2050: "bg-purple-100 text-purple-700",
} as const;
export default function JobCard({
  id,
  title,
  organization,
  location,
  salary,
  apply_url,
  source,
  posted_date,
}: JobCardProps) {

  const { isSaved, toggleJob } = useSavedJobs();

  const saved = isSaved(String(id));
  

  return (
    <div
  className="
    relative
    rounded-3xl
    border
    bg-white
    p-7
    shadow-sm
    hover:shadow-xl
    transition-all
    duration-300
    hover:-translate-y-1
    min-h-[330px]
    flex
    flex-col
  "
>
      <div className="flex justify-between items-start min-h-[100px]">

        <div>

          <h2 className="text-2xl font-bold leading-tight line-clamp-2 min-h-[64px]">
  {title}
</h2>

<p className="mt-2 text-lg font-semibold text-green-700 line-clamp-2 min-h-[56px]">
  {organization}
</p>


        </div>
        
        <button
  onClick={() =>
    toggleJob({
      id: String(id),
      title,
      organization,
      location,
      salary,
      apply_url,
      source,
    })
  }
  className="
    absolute
    right-5
    top-5
    h-11
    w-11
    rounded-full
    bg-white
    border
    shadow-sm
    flex
    items-center
    justify-center
    hover:shadow-md
  "
>
  <Bookmark
    className={`h-5 w-5 ${
      saved
        ? "fill-green-600 text-green-600"
        : "text-gray-500"
    }`}
  />
</button>

      </div>

      <div className="mt-5 min-h-[64px] flex flex-wrap content-start gap-2">

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
          <MapPin className="inline h-4 w-4" />
          {" "}
          {location}
        </span>
          <span
  className={`rounded-full px-3 py-1 text-sm font-medium ${
    source
      ? sourceColors[source as keyof typeof sourceColors] ??
        "bg-gray-100 text-gray-700"
      : "bg-gray-100 text-gray-700"
  }`}
>
  {source || "Other"}
</span>
        {salary && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            💰 {salary}
          </span>
        )}
        {posted_date && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
            <Clock className="inline h-4 w-4" /> {new Date(posted_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}

        

      </div>

      <div className="mt-auto pt-6 flex gap-3">
        
        <Link
  href={`/jobs/${id}`}
  className="
    flex-1
    text-center
    rounded-lg
    bg-green-700
    px-5
    py-3
    font-semibold
    text-white
    hover:bg-green-800
  "
>
  View Job
</Link>

        {apply_url && (
          <a
  href={apply_url}
  target="_blank"
  className="
    flex-1
    inline-flex
    justify-center
    items-center
    gap-2
    rounded-xl
    border
    border-emerald-300
    px-5
    py-3
    font-semibold
    text-emerald-700
    hover:bg-emerald-50
    transition
  "
>
  Apply Now
  <ArrowUpRight className="h-5 w-5" />
</a>
        )}

      </div>

    </div>
    
  );
}
