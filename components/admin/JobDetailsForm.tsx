import { JobFormState } from "./types";

type Props = {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
};

export default function JobDetailsForm({
  form,
  setForm,
}: Props) {
  function update(field: keyof JobFormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block font-semibold mb-2">
            Job Title
          </label>

          <input
            value={form.title}
            onChange={(e) =>
              update("title", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Organization
          </label>

          <input
            value={form.organization}
            onChange={(e) =>
              update("organization", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Website
          </label>

          <input
            value={form.website}
            onChange={(e) =>
              update("website", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Location
          </label>

          <input
            value={form.location}
            onChange={(e) =>
              update("location", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Employment Type
          </label>

          <select
            value={form.employment_type}
            onChange={(e) =>
              update("employment_type", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="">Select</option>
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Temporary</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Salary
          </label>

          <input
            value={form.salary}
            onChange={(e) =>
              update("salary", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div>

        <label className="block font-semibold mb-2">
          Job Description
        </label>

        <textarea
          rows={12}
          value={form.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>

          <label className="block font-semibold mb-2">
            Apply Method
          </label>

          <select
            value={form.apply_method}
            onChange={(e) =>
              update("apply_method", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="url">Apply URL</option>
            <option value="email">Apply Email</option>
          </select>

        </div>

        {form.apply_method === "url" ? (

          <div>

            <label className="block font-semibold mb-2">
              Apply URL
            </label>

            <input
              value={form.apply_url}
              onChange={(e) =>
                update("apply_url", e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />

          </div>

        ) : (

          <div>

            <label className="block font-semibold mb-2">
              Apply Email
            </label>

            <input
              value={form.apply_email}
              onChange={(e) =>
                update("apply_email", e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />

          </div>

        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div>

          <label className="block font-semibold mb-2">
            Contact Name
          </label>

          <input
            value={form.contact_name}
            onChange={(e) =>
              update("contact_name", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Contact Email
          </label>

          <input
            value={form.contact_email}
            onChange={(e) =>
              update("contact_email", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Contact Phone
          </label>

          <input
            value={form.contact_phone}
            onChange={(e) =>
              update("contact_phone", e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

        </div>

      </div>

    </div>
  );
}