"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { JobSubmission, JobFormState } from "./types";
import JobDetailsForm from "./JobDetailsForm";
import JobPreview from "./JobPreview";
import ActionButtons from "./ActionButtons";
import RejectSection from "./RejectSection";

type Props = {
  job: JobSubmission;
};

export default function AdminJobEditor({ job }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [rejectReason, setRejectReason] = useState("");

  const [form, setForm] = useState<JobFormState>({
    title: job.title || "",
    organization: job.organization || "",
    website: job.website || "",
    location: job.location || "",
    employment_type: job.employment_type || "",
    salary: job.salary || "",
    description: job.description || "",
    apply_method: job.apply_method || "url",
    apply_url: job.apply_url || "",
    apply_email: job.apply_email || "",
    contact_name: job.contact_name || "",
    contact_email: job.contact_email || "",
    contact_phone: job.contact_phone || "",
  });

  async function saveChanges() {
    setLoading(true);

    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: job.id,
        ...form,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (json.success) {
      setMessage("✅ Changes saved.");
      router.refresh();
    } else {
      setMessage(json.error);
    }
  }

  async function approve() {
    setLoading(true);

    const res = await fetch("/api/admin/approve-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: job.id,
        ...form,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (json.success) {
      setMessage("✅ Job approved and published.");

      router.push("/admin/jobs");
    } else {
      setMessage(json.error);
    }
  }

  async function reject() {
    setLoading(true);

    const res = await fetch("/api/admin/reject-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: job.id,
        reject_reason: rejectReason,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (json.success) {
      setMessage("❌ Submission rejected.");

      router.push("/admin/jobs");
    } else {
      setMessage(json.error);
    }
  }

  return (
    <main className="mx-auto max-w-7xl py-10">

      <div className="mb-10 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Review Job
          </h1>

          <p className="mt-2 text-gray-600">
            Review, edit and publish employer submissions.
          </p>

        </div>

        <span
          className={`rounded-full px-4 py-2 font-semibold ${
            job.status === "approved"
              ? "bg-green-100 text-green-700"
              : job.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {job.status || "pending"}
        </span>

      </div>

      {message && (

        <div className="mb-8 rounded-xl border bg-green-50 p-4">

          {message}

        </div>

      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div className="xl:col-span-2 space-y-8">

          <div className="rounded-2xl border bg-white p-8 shadow">

            <JobDetailsForm
              form={form}
              setForm={setForm}
            />

          </div>

          <JobPreview form={form} />

        </div>

        <div className="space-y-8">

          <ActionButtons
            loading={loading}
            onSave={saveChanges}
            onApprove={approve}
            onReject={reject}
          />
          <RejectSection
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
          />

        </div>

      </div>

    </main>
  );
}
