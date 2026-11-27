"use client";

import { Bookmark } from "lucide-react";
import { useSyncExternalStore } from "react";

const key = "uk-job-board-saved-jobs";
const eventName = "uk-job-board-saved-jobs-changed";

export function readSavedJobs(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function subscribeSavedJobs(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener(eventName, update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(eventName, update);
  };
}

export function SaveJobButton({ id }: { id: string }) {
  const saved = useSyncExternalStore(subscribeSavedJobs, () => readSavedJobs().includes(id), () => false);

  function toggle() {
    const jobs = readSavedJobs();
    try {
      localStorage.setItem(key, JSON.stringify(jobs.includes(id) ? jobs.filter((jobId) => jobId !== id) : [...jobs, id]));
      window.dispatchEvent(new Event(eventName));
    } catch {
      // The browser can block local storage in private contexts.
    }
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? "Remove saved job" : "Save job"}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-[#10243a] hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700">
      <Bookmark aria-hidden="true" className={`size-4 ${saved ? "fill-emerald-700 text-emerald-700" : ""}`} />
    </button>
  );
}
