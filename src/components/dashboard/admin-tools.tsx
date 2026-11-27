"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

export const adminPanel = "min-w-0 rounded-2xl border border-[#e1e9ef] bg-white p-4 shadow-sm sm:p-5";
export const adminInput = "mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";
export const adminButton = "bg-[#08744d] text-white hover:bg-[#075a3e]";
export const adminDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" });
export type AdminActivityItem = { _id: string; actorId?: string; action: string; target: string; createdAt: string };

function useAdminData<T>(path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    backendRequest<T>(path, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) { setData(result); setError(""); } })
      .catch((error) => { if (!controller.signal.aborted) setError(backendErrorMessage(error)); });
    return () => controller.abort();
  }, [path, refresh]);
  return { data, setData, error, reload: () => setRefresh((value) => value + 1) };
}

function LoadState({ error, children }: { error: string; children?: ReactNode }) {
  if (error) return <p role="alert" className="text-sm text-red-700">{error}</p>;
  return children ?? <p role="status" className="text-sm text-slate-600">Loading…</p>;
}

export function AdminUsers({ emailEnabled }: { emailEnabled: boolean }) {
  type User = { _id: string; name: string; email: string; role?: string; accountType?: string; active?: boolean; emailVerified?: boolean };
  const { data, setData, error } = useAdminData<{ users: User[] }>("/api/admin/users");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState("");
  const [feedback, setFeedback] = useState("");
  const [failure, setFailure] = useState("");
  const filtered = data?.users.filter((user) => `${user.name} ${user.email} ${user.role ?? user.accountType ?? "seeker"}`.toLowerCase().includes(query.trim().toLowerCase()));
  const isLoaded = Boolean(data);
  useEffect(() => {
    if (!isLoaded || !window.location.hash.startsWith("#user-")) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "nearest" });
  }, [isLoaded]);

  async function change(user: User) {
    const active = user.active === false;
    if (pending || (!active && !window.confirm(`Disable ${user.name}’s account?`))) return;
    setPending(user._id); setFailure(""); setFeedback("");
    try {
      await backendRequest(`/api/admin/users/${user._id}`, { method: "PATCH", body: JSON.stringify({ active }) });
      setData((current) => current && { users: current.users.map((item) => item._id === user._id ? { ...item, active } : item) });
      setFeedback(active ? "Account reactivated." : "Account disabled.");
    } catch (error) { setFailure(backendErrorMessage(error)); }
    finally { setPending(""); }
  }

  async function sendReset(user: User) {
    if (pending || !window.confirm(`Send a password reset link to ${user.email}?`)) return;
    setPending(user._id); setFailure(""); setFeedback("");
    try {
      const result = await authClient.requestPasswordReset({ email: user.email, redirectTo: "/reset-password" });
      if (result.error) throw new Error(result.error.message || "Could not request a password reset.");
      setFeedback("Password reset requested.");
    } catch (error) { setFailure(backendErrorMessage(error)); }
    finally { setPending(""); }
  }

  return (
    <section className={adminPanel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-extrabold">User accounts</h2>
        <input aria-label="Filter users" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or role" className="min-h-10 w-full max-w-xs rounded-lg border border-slate-300 px-3 text-sm" />
      </div>
      {feedback && <p role="status" className="mb-3 text-sm text-emerald-800">{feedback}</p>}
      {failure && <p role="alert" className="mb-3 text-sm text-red-700">{failure}</p>}
      <LoadState error={error}>{filtered && (filtered.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200" role="region" aria-label="User accounts" tabIndex={0}>
          <table className="w-full min-w-[36rem] text-left text-sm"><thead className="bg-slate-100"><tr>{["Name", "Email", "Role", "Status", "Action"].map((label) => <th scope="col" key={label} className="px-3 py-2">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((user) => <tr key={user._id} id={`user-${user._id}`}>
              <td className="px-3 py-2 font-semibold">{user.name}</td><td className="px-3 py-2">{user.email}{user.emailVerified && <span className="ml-2 text-xs text-emerald-800">Verified</span>}</td>
              <td className="px-3 py-2 capitalize">{user.role ?? user.accountType ?? "seeker"}</td>
              <td className="px-3 py-2">{user.active === false ? "Disabled" : "Active"}</td>
              <td className="px-3 py-2">{user.role !== "admin" && <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={!!pending} onClick={() => change(user)}>{pending === user._id ? "Working…" : user.active === false ? "Reactivate" : "Disable"}</Button>
                {emailEnabled && user.active !== false && <Button type="button" variant="ghost" disabled={!!pending} onClick={() => sendReset(user)}>Send reset link</Button>}
              </div>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="text-sm text-slate-600">No accounts match your search.</p>)}</LoadState>
    </section>
  );
}

const templateLabels: Record<string, string> = {
  companySubmitted: "Company application submitted", companyApproved: "Company approved", companyRejected: "Company rejected",
  applicationSubmitted: "Applicant confirmation", applicationReceived: "Admin application notification", applicationForwarded: "Application forwarded",
};

export function AdminEmailTemplates() {
  const { data, error } = useAdminData<{ templates: { key: string; subject: string; text: string }[] }>("/api/admin/email-templates");
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  async function save(event: FormEvent<HTMLFormElement>, key: string) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setPending(key); setMessage(""); setFailure("");
    try {
      await backendRequest(`/api/admin/email-templates/${key}`, { method: "PATCH", body: JSON.stringify({ subject: values.get("subject"), text: values.get("text") }) });
      setMessage("Email template saved.");
    } catch (error) { setFailure(backendErrorMessage(error)); }
    finally { setPending(""); }
  }
  return (
    <section className={adminPanel}>
      <h2 className="font-extrabold">Workflow emails</h2>
      <p className="mt-2 text-sm text-slate-600">Keep placeholders such as {"{{company}}"}, {"{{job}}"} and {"{{reason}}"} where you want the relevant details inserted.</p>
      {message && <p role="status" className="mt-3 text-sm text-emerald-800">{message}</p>}
      {failure && <p role="alert" className="mt-3 text-sm text-red-700">{failure}</p>}
      <div className="mt-4 space-y-3"><LoadState error={error}>{data?.templates.map((item) => (
        <details key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-bold">{templateLabels[item.key] ?? item.key}</summary>
          <form method="post" onSubmit={(event) => save(event, item.key)} className="mt-4 space-y-3">
            <label className="block text-sm font-semibold">Subject<input name="subject" defaultValue={item.subject} maxLength={160} required className={adminInput} /></label>
            <label className="block text-sm font-semibold">Message<textarea name="text" defaultValue={item.text} maxLength={4000} required rows={4} className={adminInput} /></label>
            <Button type="submit" disabled={!!pending} className={adminButton}>{pending === item.key ? "Saving…" : "Save template"}</Button>
          </form>
        </details>
      ))}</LoadState></div>
    </section>
  );
}

export function AdminSiteSettings() {
  const { data, error } = useAdminData<{ settings: { contactEmail: string; featuredDays: number } }>("/api/admin/settings");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true); setMessage(""); setFailure("");
    try {
      await backendRequest("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ contactEmail: values.get("contactEmail"), featuredDays: Number(values.get("featuredDays")) }) });
      setMessage("Site settings saved.");
    } catch (error) { setFailure(backendErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <section className={adminPanel}>
      <h2 className="mb-3 font-extrabold">Job board preferences</h2>
      <LoadState error={error}>{data && <form method="post" onSubmit={save} className="max-w-lg space-y-4">
        <label className="block text-sm font-semibold">Contact and admin notification email<input type="email" name="contactEmail" maxLength={254} defaultValue={data.settings.contactEmail} required className={adminInput} /></label>
        <label className="block text-sm font-semibold">Hot listing duration (days)<input type="number" name="featuredDays" min={1} max={30} defaultValue={data.settings.featuredDays} required className={adminInput} /></label>
        <Button type="submit" disabled={busy} className={adminButton}>{busy ? "Saving…" : "Save settings"}</Button>
      </form>}</LoadState>
      {message && <p role="status" className="mt-3 text-sm text-emerald-800">{message}</p>}
      {failure && <p role="alert" className="mt-3 text-sm text-red-700">{failure}</p>}
    </section>
  );
}

export function AdminActivity() {
  const { data, error, reload } = useAdminData<{ activity: AdminActivityItem[] }>("/api/admin/activity");
  const [query, setQuery] = useState("");
  const filtered = data?.activity.filter((entry) => `${entry.action} ${entry.target}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section className={adminPanel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-extrabold">Recent logged actions</h2>
        <div className="flex flex-wrap gap-2"><input aria-label="Filter activity" placeholder="Filter events" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm" /><Button type="button" variant="outline" onClick={reload}>Refresh</Button></div>
      </div>
      <LoadState error={error}>{filtered && (filtered.length ? <ul className="divide-y divide-slate-100">
        {filtered.map((entry) => <li key={entry._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><p className="font-semibold">{entry.action}</p><p className="text-xs text-slate-600 [overflow-wrap:anywhere]">{entry.target}{entry.actorId ? ` · Actor ${entry.actorId}` : ""}</p></div><time dateTime={entry.createdAt}>{adminDate.format(new Date(entry.createdAt))}</time></li>)}
      </ul> : <p className="text-sm text-slate-600">No activity matches this filter.</p>)}</LoadState>
    </section>
  );
}
