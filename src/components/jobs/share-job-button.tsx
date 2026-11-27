"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareJobButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    setMessage("");
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setMessage("Copy the URL from your address bar to share this job.");
    }
  }

  return (
    <>
      <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50">
        <Share2 aria-hidden="true" className="size-4" /> Share
      </button>
      <span role="status" className="text-sm text-slate-600">{message}</span>
    </>
  );
}
