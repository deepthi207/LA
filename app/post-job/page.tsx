"use client";

import { useState } from "react";

export default function PostJobPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    organization: "",
    website: "",
    location: "",
    employment_type: "",
    salary: "",
    description: "",
    apply_method: "url",
    apply_url: "",
    apply_email: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/post-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    setLoading(false);

    if (json.success) {
      setSuccess(true);

      setForm({
        title: "",
        organization: "",
        website: "",
        location: "",
        employment_type: "",
        salary: "",
        description: "",
        apply_method: "url",
        apply_url: "",
        apply_email: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      });
    } else {
      alert(json.error);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 shadow">

        <h1 className="text-4xl font-bold mb-2">
          Post a Job
        </h1>

        <p className="mb-8 text-gray-600">
          Reach nonprofit professionals across California.
        </p>

        {success && (
          <div className="mb-8 rounded-lg bg-green-100 p-4 text-green-700">
            Job submitted successfully.
            <br />
            Our team will review it before publishing.
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">

          <div>

            <h2 className="font-bold text-xl mb-4">
              Job Information
            </h2>

            <input
              required
              placeholder="Job Title"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.title}
              onChange={(e)=>update("title",e.target.value)}
            />

            <input
              required
              placeholder="Organization"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.organization}
              onChange={(e)=>update("organization",e.target.value)}
            />

            <input
              placeholder="Organization Website"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.website}
              onChange={(e)=>update("website",e.target.value)}
            />

            <input
              placeholder="Location"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.location}
              onChange={(e)=>update("location",e.target.value)}
            />

            <select
              className="w-full border rounded-lg p-3 mb-4"
              value={form.employment_type}
              onChange={(e)=>update("employment_type",e.target.value)}
            >
              <option value="">Employment Type</option>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Temporary</option>
            </select>

            <input
              placeholder="Salary (optional)"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.salary}
              onChange={(e)=>update("salary",e.target.value)}
            />

            <textarea
              required
              rows={12}
              placeholder="Job Description"
              className="w-full border rounded-lg p-3"
              value={form.description}
              onChange={(e)=>update("description",e.target.value)}
            />

          </div>

          <div>

            <h2 className="font-bold text-xl mb-4">
              Apply Method
            </h2>

            <select
              className="w-full border rounded-lg p-3 mb-4"
              value={form.apply_method}
              onChange={(e)=>update("apply_method",e.target.value)}
            >
              <option value="url">Apply URL</option>
              <option value="email">Apply by Email</option>
            </select>

            {form.apply_method==="url" && (

              <input
                placeholder="Application URL"
                className="w-full border rounded-lg p-3"
                value={form.apply_url}
                onChange={(e)=>update("apply_url",e.target.value)}
              />

            )}

            {form.apply_method==="email" && (

              <input
                placeholder="Application Email"
                className="w-full border rounded-lg p-3"
                value={form.apply_email}
                onChange={(e)=>update("apply_email",e.target.value)}
              />

            )}

          </div>

          <div>

            <h2 className="font-bold text-xl mb-4">
              Contact Information
            </h2>

            <input
              placeholder="Contact Name"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.contact_name}
              onChange={(e)=>update("contact_name",e.target.value)}
            />

            <input
              required
              type="email"
              placeholder="Contact Email"
              className="w-full border rounded-lg p-3 mb-4"
              value={form.contact_email}
              onChange={(e)=>update("contact_email",e.target.value)}
            />

            <input
              placeholder="Phone"
              className="w-full border rounded-lg p-3"
              value={form.contact_phone}
              onChange={(e)=>update("contact_phone",e.target.value)}
            />

          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-4 text-white text-lg font-semibold hover:bg-green-800"
          >
            {loading ? "Submitting..." : "Submit Job"}
          </button>

        </form>

      </div>
    </main>
  );
}