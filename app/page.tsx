import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import RefreshButton from "../components/RefreshButton";
import JobsDigest from "@/components/JobsDigest";
import MyJobs from "@/components/MyJobs";
import FilterPills from "@/components/FilterPills";
import { supabase } from "../lib/supabase";

type Props = {
  searchParams: Promise<{
    search?: string;
    source?: string;
    location?: string;
    recency?: string;
  title?: string;
  category?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

const search = Array.isArray(params.search)
  ? params.search[0]
  : params.search;

const source = Array.isArray(params.source)
  ? params.source[0]
  : params.source;

const location = Array.isArray(params.location)
  ? params.location[0]
  : params.location;

const recency = Array.isArray(params.recency)
  ? params.recency[0]
  : params.recency;

const title = Array.isArray(params.title)
  ? params.title[0]
  : params.title;

const category = Array.isArray(params.category)
  ? params.category[0]
  : params.category;

  let query = supabase
  .from("jobs")
  .select("*")
  .order("created_at", { ascending: false });

if (search) {
  query = query.or(
    `title.ilike.%${search}%,organization.ilike.%${search}%,location.ilike.%${search}%`
  );
}
console.log("Source value:", source);
console.log("Type:", typeof source);
if (source === "Other") {
  query = query.not(
    "source",
    "in",
    `("Indeed","Idealist","LA2050","Greenhouse","Dan's List","LinkedIn")`
  );
} else if (source) {
  query = query.eq("source", source);
}
if (location) {
  query = query.ilike("location", `%${location}%`);
}
if (title) {
  query = query.ilike("title", `%${title}%`);
}
if (category) {
  query = query.ilike("category", `%${category}%`);
}
if (recency) {
  const daysByLabel: Record<string, number> = {
    "Last 24h": 1,
    "Last 7 days": 7,
    "Last 14 days": 14,
    "Last 30 days": 30,
  };
  const days = daysByLabel[recency];
  if (days) {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    query = query.gte("created_at", since);
  }
}

  const { data: jobs, error } = await query.limit(20);

console.log("========== HOME PAGE ==========");
console.log("Error:", error);
console.log("Jobs returned:", jobs?.length);

if (jobs) {
  console.table(
    jobs.map((job) => ({
      id: job.id,
      title: job.title,
      source: job.source,
      created_at: job.created_at,
    }))
  );
}

console.log("========== HOME PAGE ==========");
console.log("Search:", search);
console.log("Source:", source);
console.log("Location:", location);
console.log("Error:", error);
console.log("Jobs returned:", jobs?.length);
console.table(
  jobs?.map((job) => ({
    title: job.title,
    organization: job.organization,
    location: job.location,
    source: job.source,
  }))
);

  if (error) {
    console.error(error);

    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">Supabase Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-green-800">
              Los Angeles Nonprofit Jobs
            </h1>

            <p className="text-sm text-stone-500">
              Aggregated from Indeed, LinkedIn & Idealist
            </p>
          </div>

          <div className="flex gap-3">
            <a
  href="/post-job"
  className="rounded-lg border px-4 py-2 text-sm font-medium"
>
  Post a Job
</a>

            <RefreshButton />
            
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700">
            Mission-driven opportunities
          </p>

          <h2 className="text-5xl font-bold">
            Find Your Next Mission
          </h2>

          <p className="mt-4 max-w-2xl text-lg text-stone-600">
            Search nonprofit jobs aggregated from multiple job boards.
          </p>

          <SearchBar />
          <div className="mt-8 space-y-4">
  <FilterPills
  param="source"
  currentValue={source}
  options={[
    "All",
    "Indeed",
    "Idealist",
    "Greenhouse",
    "LinkedIn",
    "LA2050",
    "Dan's List",
    "Other",
  ]}
/>

  <FilterPills
    title="RECENCY"
    param="recency"
    currentValue={recency}
    options={["Last 24h", "Last 7 days", "Last 14 days", "Last 30 days"]}
  />

  <FilterPills
    title="TITLE"
    param="title"
    currentValue={title}
    options={["CEO", "Executive Director", "Director", "Manager", "Coordinator"]}
  />

  <FilterPills
    title="CATEGORY"
    param="category"
    currentValue={category}
    options={["Fundraising", "Finance", "Communications", "Programs", "Operations", "Development", "Marketing"]}
  />
</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">

  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

    
  
  {/* Jobs */}
  <div className="lg:col-span-3">

  {jobs && jobs.length > 0 ? (

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {jobs.map((job) => (

        <JobCard
          key={job.id}
          id={job.id}
          title={job.title}
          organization={job.organization}
          location={job.location}
          salary={job.salary || undefined}
          apply_url={job.apply_url || undefined}
          posted_date={job.posted_date || job.created_at}
          source={job.source || undefined}
        />

      ))}

    </div>
    

  ) : (

    <div className="rounded-xl bg-white p-8 text-center shadow">

      <h2 className="text-2xl font-bold">
        No jobs found
      </h2>

      <p className="mt-2 text-gray-600">
        Try a different search.
      </p>

    </div>

  )}

</div>
{/* Sidebar */}
    <div className="space-y-6">
      <MyJobs />
      <JobsDigest />
    </div>

</div>
</section>
</main>
);
}
