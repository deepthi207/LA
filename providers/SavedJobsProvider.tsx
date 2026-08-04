"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SavedJob } from "@/types/job";

const STORAGE_KEY = "savedJobs";

type SavedJobsContextType = {
  savedJobs: SavedJob[];
  toggleJob: (job: SavedJob) => void;
  isSaved: (id: string) => boolean;
  clearJobs: () => void;
  count: number;
};

const SavedJobsContext = createContext<SavedJobsContextType | null>(null);

export function SavedJobsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setSavedJobs(JSON.parse(stored));
      } catch {
        setSavedJobs([]);
      }
    }
  }, []);

  function save(jobs: SavedJob[]) {
    setSavedJobs(jobs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }

  function isSaved(id: string) {
    return savedJobs.some((job) => job.id === id);
  }

  function toggleJob(job: SavedJob) {
    if (isSaved(job.id)) {
      save(savedJobs.filter((j) => j.id !== job.id));
    } else {
      save([...savedJobs, job]);
    }
  }

  function clearJobs() {
    save([]);
  }

  const value = {
  savedJobs,
  toggleJob,
  isSaved,
  clearJobs,
  count: savedJobs.length,
};

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);

  if (!context) {
    throw new Error(
      "useSavedJobs must be used inside SavedJobsProvider"
    );
  }

  return context;
}