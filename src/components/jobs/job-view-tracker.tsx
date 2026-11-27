"use client";

import { backendEndpoint } from "@/lib/backend";
import { useEffect, useRef } from "react";

export function JobViewTracker({ id }: { id: string }) {
  const counted = useRef<string>(null);
  useEffect(() => {
    if (counted.current === id) return;
    const key = `uk-job-board-view:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Browsers can disable session storage. Count at most once for this mount.
    }
    counted.current = id;
    void fetch(backendEndpoint(`/api/jobs/${id}/view`), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", keepalive: true,
    }).then((response) => {
      if (!response.ok) throw new Error("View not recorded");
    }).catch(() => {
      try { sessionStorage.removeItem(key); } catch {}
    });
  }, [id]);
  return null;
}
