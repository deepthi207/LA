"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  title?: string;
  param: string;
  currentValue?: string;
  options: string[];
};

export default function FilterPills({
  title,
  param,
  currentValue,
  options,
}: Props) {
  const searchParams = useSearchParams();

  function hrefFor(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    const isCurrentlySelected = currentValue === value;

if (value === "All" || isCurrentlySelected) {
  params.delete(param);
} else {
  params.set(param, value);
}

    const query = params.toString();

    return query ? `/?${query}` : "/";
  }

  return (
    <div className="flex items-start gap-5">
      {title && (
        <p className="w-24 pt-2 text-sm font-bold uppercase tracking-wide text-stone-500">
          {title}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const active =
            currentValue === option ||
            (!currentValue && option === "All");

          return (
            <Link
              key={option}
              href={hrefFor(option)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-800 hover:bg-stone-200"
              }`}
            >
              {option}
            </Link>
          );
        })}
      </div>
    </div>
  );
}