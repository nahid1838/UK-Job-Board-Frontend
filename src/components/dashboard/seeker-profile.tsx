"use client";

import { Button } from "@/components/ui/button";
import { backendEndpoint, backendErrorMessage, backendRequest } from "@/lib/backend";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useState, type FormEvent } from "react";

export type SeekerProfile = {
  name?: string; phone?: string; location?: string; headline?: string; bio?: string;
  photo?: string; cvType?: "pdf" | "docx"; notificationsReadAt?: string;
};

const fieldStyle = "mt-1.5 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";
export const seekerPanel = "min-w-0 rounded-2xl border border-[#dce5ed] bg-white/85 p-5 shadow-sm sm:p-6";

export function SeekerAvatar({ name, photo }: { name: string; photo?: string }) {
  return photo
    ? <Image unoptimized src={photo} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full border border-slate-200 object-cover" />
    : <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-[#def0e9] font-extrabold text-[#0a5341]">{name.trim()[0]?.toUpperCase() ?? "U"}</span>;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file. Select it again."));
    reader.readAsDataURL(file);
  });
}

export function PersonalProfileEditor({ profile, accountName, email, update, role = "seeker" }: {
  profile: SeekerProfile; accountName: string; email: string; update: (changes: Partial<SeekerProfile>) => void;
  role?: "seeker" | "employer";
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const changed = {
        name: String(values.get("name")).trim(),
        phone: String(values.get("phone")).trim(),
        location: String(values.get("location")).trim(),
        headline: String(values.get("headline")).trim(),
        bio: String(values.get("bio")).trim(),
      };
      await backendRequest(`/api/${role}/profile`, { method: "PATCH", body: JSON.stringify(changed) });
      update(changed);
      setNotice("Profile saved.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PersonalPhotoEditor name={profile.name || accountName} photo={profile.photo} update={update} role={role} />
      <form method="post" onSubmit={save} className={`${seekerPanel} space-y-5`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">{role === "employer" ? "Display name" : "Full name"}<input name="name" required maxLength={120} defaultValue={profile.name ?? accountName} autoComplete="name" className={fieldStyle} /></label>
          <label className="text-sm font-semibold">Sign-in email<input value={email} readOnly className={`${fieldStyle} bg-slate-50`} /></label>
          <label className="text-sm font-semibold">Phone<input name="phone" type="tel" maxLength={40} defaultValue={profile.phone} autoComplete="tel" className={fieldStyle} /></label>
          <label className="text-sm font-semibold">UK location<input name="location" maxLength={120} defaultValue={profile.location} autoComplete="address-level2" className={fieldStyle} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Professional headline<input name="headline" maxLength={120} defaultValue={profile.headline} className={fieldStyle} /></label>
          <label className="text-sm font-semibold sm:col-span-2">About me<textarea name="bio" rows={5} maxLength={1500} defaultValue={profile.bio} className={fieldStyle} /></label>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        <Button type="submit" disabled={busy} className="min-h-11 bg-[#075b43] hover:bg-[#064733]">{busy ? "Saving…" : "Save profile"}</Button>
      </form>
    </div>
  );
}

function PersonalPhotoEditor({ name, photo, update, role }: {
  name: string; photo?: string; update: (changes: Partial<SeekerProfile>) => void;
  role: "seeker" | "employer";
}) {
  const [preview, setPreview] = useState<string>();
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function choose(file?: File) {
    if (!file) return;
    setError("");
    setNotice("");
    setPreview(undefined);
    if (!file.size || file.size > 1048576 || !["image/png", "image/jpeg"].includes(file.type)) {
      setError("Choose a PNG or JPEG image up to 1 MB.");
      return;
    }
    setReading(true);
    try {
      setPreview(await readFile(file));
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setReading(false);
    }
  }

  async function save() {
    if (preview === undefined || saving) return;
    setSaving(true);
    setError("");
    try {
      await backendRequest(`/api/${role}/profile`, {
        method: "PATCH", body: JSON.stringify({ photo: preview }),
      });
      update({ photo: preview });
      setNotice(preview ? "Profile photo updated." : "Profile photo removed.");
      setPreview(undefined);
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="profile-photo" aria-labelledby="profile-photo-title" className={`${seekerPanel} scroll-mt-4`}>
      <h2 id="profile-photo-title" className="text-lg font-extrabold">Profile photo</h2>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <SeekerAvatar name={name} photo={preview ?? photo} />
        <div>
          <label className="relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-900 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-700">
            <Camera aria-hidden="true" className="size-4" /> {photo ? "Change photo" : "Add photo"}
            <input type="file" accept="image/png,image/jpeg" disabled={reading || saving} className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                void choose(file);
              }} />
          </label>
          <p className="mt-1.5 text-sm text-slate-600">PNG or JPEG, up to 1 MB.</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {preview !== undefined && <>
          <Button type="button" disabled={saving} onClick={save} className="bg-[#075b43] hover:bg-[#064733]">{saving ? "Saving…" : "Save photo"}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => { setPreview(undefined); setError(""); }}>Cancel</Button>
        </>}
        {photo && preview === undefined && <Button type="button" variant="ghost" disabled={reading} onClick={() => { setPreview(""); setError(""); setNotice(""); }}>Remove photo</Button>}
      </div>
      {reading && <p role="status" className="mt-2 text-sm text-slate-600">Loading preview…</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-2 text-sm text-emerald-800">{notice}</p>}
    </section>
  );
}

export function SeekerCvEditor({ cvType, update }: { cvType?: SeekerProfile["cvType"]; update: (type?: SeekerProfile["cvType"]) => void }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("cv");
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(file.name)) {
      setError("Choose a PDF or DOCX CV up to 5 MB.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const source = await readFile(file);
      await backendRequest("/api/seeker/cv", { method: "PUT", body: JSON.stringify({ file: source.split(",")[1] }) });
      update(/\.pdf$/i.test(file.name) ? "pdf" : "docx");
      form.reset();
      setNotice("CV saved.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await backendRequest("/api/seeker/cv", { method: "DELETE", body: "{}" });
      update(undefined);
      setNotice("CV removed.");
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={seekerPanel}>
      <p className="text-sm text-slate-700">Store a private copy of your CV. Job application uploads are handled separately.</p>
      {cvType && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-3">
        <a href={backendEndpoint("/api/seeker/cv").href} className="text-sm font-bold text-emerald-900 underline">Download current CV</a>
        <Button type="button" variant="outline" disabled={busy} onClick={remove}>Remove</Button>
      </div>}
      <form method="post" onSubmit={upload} className="mt-5 space-y-3">
        <label className="block text-sm font-semibold">Choose CV (PDF or DOCX, up to 5 MB)
          <input name="cv" type="file" accept=".pdf,.docx" required className={fieldStyle} />
        </label>
        <Button type="submit" disabled={busy} className="min-h-11 bg-[#075b43] hover:bg-[#064733]">{busy ? "Please wait…" : cvType ? "Replace CV" : "Upload CV"}</Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
    </div>
  );
}

export function AccountEmailEditor({ verified, callbackURL = "/dashboard/seeker/settings" }: { verified: boolean; callbackURL?: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const newEmail = String(new FormData(form).get("newEmail") ?? "").trim();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await authClient.changeEmail({ newEmail, callbackURL });
      if (result.error) throw new Error(result.error.message || "Could not start the email change.");
      setNotice(verified
        ? "If the new address is available, you’ll receive instructions at your current email first."
        : "If the address is available, a verification link will be sent to the new email.");
      form.reset();
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form method="post" onSubmit={changeEmail} className="mt-5 border-t border-slate-200 pt-4">
      <h3 className="mb-2 text-sm font-extrabold">Change sign-in email</h3>
      <label className="block max-w-sm text-sm font-semibold">New email address
        <input name="newEmail" type="email" autoComplete="email" required maxLength={254} className={fieldStyle} />
      </label>
      <Button type="submit" variant="outline" disabled={busy} className="mt-3">{busy ? "Sending…" : "Request email change"}</Button>
      {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </form>
  );
}
