"use client";

import { CompanyLogo } from "@/components/jobs/company-logo";
import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import { ImageIcon, Upload } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

export function CompanyLogoForm({ name, currentLogo, onSaved }: { name: string; currentLogo?: string; onSaved?: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [logo, setLogo] = useState("");
  const [error, setError] = useState("");
  const inputId = useId();
  const displayedLogo = logo || currentLogo;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("logo");
    setError("");
    if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024 || !["image/png", "image/jpeg"].includes(file.type)) {
      setError("Choose a PNG or JPEG logo up to 2 MB.");
      toast.error("Invalid logo file", { description: "Choose a PNG or JPEG logo up to 2 MB." });
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
      toast.success("Company logo updated");
    } catch (error) {
      const message = backendErrorMessage(error);
      setError(message);
      toast.error("Couldn’t update the company logo", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby={`${inputId}-title`} className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 id={`${inputId}-title`} className="font-semibold text-slate-900">Company logo</h3>
      <p className="mt-1 text-sm text-slate-600">Your logo appears on your public company profile and job cards.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600">Current logo</p>
          {displayedLogo ? (
            <div className="mt-2 flex min-h-12 items-center"><CompanyLogo name={name} src={displayedLogo} /></div>
          ) : (
            <p className="mt-2 flex min-h-12 items-center gap-2 text-sm text-slate-600">
              <ImageIcon aria-hidden="true" className="size-4 shrink-0" /> No logo yet
            </p>
          )}
        </div>
        <form method="post" onSubmit={save} aria-busy={isSaving} className="min-w-0 space-y-3">
          <div>
            <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">{displayedLogo ? "Choose a replacement" : "Choose a logo"}</label>
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-600">PNG or JPEG, up to 2 MB.</p>
          </div>
          <input
            id={inputId}
            name="logo"
            type="file"
            accept="image/png,image/jpeg"
            aria-describedby={error ? `${inputId}-hint ${inputId}-error` : `${inputId}-hint`}
            aria-invalid={Boolean(error)}
            onChange={() => setError("")}
            disabled={isSaving}
            required
            className="block w-full min-w-0 rounded-lg border border-slate-200 bg-white p-1.5 text-sm text-slate-600 file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-900 hover:file:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700"
          />
          {error && <p id={`${inputId}-error`} role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={isSaving} className="bg-emerald-800 text-white hover:bg-emerald-900">
            <Upload aria-hidden="true" className="size-4" />
            {isSaving ? "Uploading…" : "Save logo"}
          </Button>
        </form>
      </div>
    </section>
  );
}
