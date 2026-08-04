import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminJobEditor from "@/components/admin/AdminJobEditor";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {

  const { id } = await params;

  const { data: job } = await supabaseAdmin
    .from("job_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) {
    notFound();
  }

  return <AdminJobEditor job={job} />;
}