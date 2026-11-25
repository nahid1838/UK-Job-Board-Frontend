"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function BackendAccessCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  async function checkAccess() {
    setIsChecking(true);
    setMessage("");
    const options: RequestInit = { credentials: "include", cache: "no-store" };

    try {
      const session = await fetch(new URL("/api/me", backendUrl), options);
      if (session.status === 401) {
        setMessage("The backend could not find your session. Sign in again and retry.");
        return;
      }
      if (!session.ok) {
        setMessage("The backend could not verify your session. Please try again.");
        return;
      }

      const { user } = await session.json();
      const admin = await fetch(new URL("/api/admin/check", backendUrl), options);
      const sessionMessage = `Backend recognised your account as ${user.role}.`;

      if (admin.ok) {
        setMessage(`${sessionMessage} Admin access granted.`);
      } else if (admin.status === 403) {
        setMessage(`${sessionMessage} Admin access denied.`);
      } else {
        setMessage(`${sessionMessage} The admin access check could not complete.`);
      }
    } catch {
      setMessage("Could not reach the backend. Check that it is running and try again.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Backend access check</h2>
      <p className="mt-2 text-sm text-slate-600">Check whether the backend recognises your session and role.</p>
      <Button type="button" variant="outline" onClick={checkAccess} disabled={isChecking} className="mt-4 min-h-10">
        {isChecking ? "Checking…" : "Check backend access"}
      </Button>
      <p role="status" className={message ? "mt-3 text-sm text-slate-700" : "sr-only"}>{message}</p>
    </section>
  );
}
