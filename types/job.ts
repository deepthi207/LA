export interface SavedJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  salary?: string | null;
  apply_url?: string | null;
  source?: string | null;
}