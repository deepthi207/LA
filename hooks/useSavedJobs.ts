"use client";

import { useState } from "react";
import { SavedJob } from "@/types/job";

const STORAGE_KEY = "savedJobs";

function getInitialJobs(): SavedJob[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(getInitialJobs);

  function updateJobs(jobs: SavedJob[]) {
    setSavedJobs(jobs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }

  function isSaved(id: string) {
    return savedJobs.some((job) => job.id === id);
  }

  function toggleJob(job: SavedJob) {
    if (isSaved(job.id)) {
      updateJobs(savedJobs.filter((j) => j.id !== job.id));
    } else {
      updateJobs([...savedJobs, job]);
    }
  }

  function clearJobs() {
    updateJobs([]);
  }

  return {
    savedJobs,
    isSaved,
    toggleJob,
    clearJobs,
    count: savedJobs.length,
  };
}