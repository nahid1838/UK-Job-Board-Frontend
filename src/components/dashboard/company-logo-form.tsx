"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { useState, type FormEvent } from "react";
import { CompanyLogo } from "@/components/jobs/company-logo";

export function CompanyLogoForm({ name, currentLogo, onSaved }: { name: string; currentLogo?: string; onSaved?: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [logo, setLogo] = useState("");
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("logo");
    setError("");
    if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024 || !["image/png", "image/jpeg"].includes(file.type)) {
      setError("Choose a PNG or JPEG logo up to 2 MB.");
      return;
    }
    setIsSaving(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Could not read this image. Select it again."));
        reader.readAsDataURL(file);
      });
      const { logoUrl } = await backendRequest<{ logoUrl: string }>("/api/company-logo", {
        method: "PUT", body: JSON.stringify({ image }),
      });
      setLogo(`${logoUrl}?v=${Date.now()}`);
      onSaved?.();
      form.reset();
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form method="post" onSubmit={save} className="mt-5 rounded-xl border border-slate-200 p-4">
      <label className="block text-sm font-semibold">Company logo
        <input name="logo" type="file" accept="image/png,image/jpeg" required className="mt-2 block w-full text-sm" />
      </label>
      <p className="mt-2 text-sm text-slate-600">PNG or JPEG, up to 2 MB. Your logo appears on public job cards and your company profile.</p>
      <Button type="submit" variant="outline" disabled={isSaving} className="mt-3">{isSaving ? "Uploading…" : "Save logo"}</Button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {(logo || currentLogo) && <div className="mt-3"><CompanyLogo name={name} src={logo || currentLogo} /></div>}
      {logo && <p role="status" className="mt-2 text-sm text-emerald-800">Company logo saved.</p>}
    </form>
  );
}
