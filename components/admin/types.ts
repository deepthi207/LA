export type JobSubmission = {
  id: string;

  title: string | null;
  organization: string | null;
  website: string | null;
  location: string | null;
  employment_type: string | null;
  salary: string | null;
  description: string | null;

  apply_method: string | null;
  apply_url: string | null;
  apply_email: string | null;

  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;

  status: string | null;
};

export type JobFormState = {
  title: string;
  organization: string;
  website: string;
  location: string;
  employment_type: string;
  salary: string;
  description: string;

  apply_method: string;
  apply_url: string;
  apply_email: string;

  contact_name: string;
  contact_email: string;
  contact_phone: string;
};