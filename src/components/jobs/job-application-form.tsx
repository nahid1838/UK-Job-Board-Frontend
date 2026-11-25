"use client";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import Link from "next/link";
import { useState, type FormEvent } from "react";

const fieldStyle = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";

function readCv(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the CV. Select the file again."));
    reader.readAsDataURL(file);
  });
}

export function JobApplicationForm({ jobId, name, email }: { jobId: string; name: string; email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const fields = new FormData(event.currentTarget);
    const cv = fields.get("cv");
    setError("");

    if (!(cv instanceof File) || !cv.size || cv.size > 5 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(cv.name)) {
      setError("Choose a PDF or DOCX CV up to 5 MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      await backendRequest("/api/job-applications", {
        method: "POST",
        body: JSON.stringify({
          jobId,
          name: fields.get("name"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          coverLetter: fields.get("coverLetter"),
          acceptedConsent: fields.has("acceptedConsent"),
          cvBase64: await readCv(cv),
        }),
      });
      setSubmitted(true);
    } catch (error) {
      setError(backendErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p role="status" className="font-semibold text-emerald-950">Application submitted.</p>
        <p className="mt-1 text-sm text-emerald-900">An admin will review it before sharing it with the employer.</p>
        <Link href="/dashboard/seeker/applications" className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline">View my applications</Link>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={submitApplication} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Full name
          <input name="name" maxLength={120} defaultValue={name} autoComplete="name" required className={fieldStyle} />
        </label>
        <label className="text-sm font-semibold">Email address
          <input name="email" type="email" maxLength={254} defaultValue={email} autoComplete="email" required className={fieldStyle} />
        </label>
        <label className="text-sm font-semibold">Phone
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" required className={fieldStyle} />
        </label>
        <label className="min-w-0 text-sm font-semibold">CV
          <input name="cv" type="file" accept=".pdf,.docx" required aria-describedby="cv-help" className={fieldStyle} />
          <span id="cv-help" className="mt-1 block font-normal text-slate-600">PDF or DOCX, up to 5 MB.</span>
        </label>
      </div>
      <label className="block text-sm font-semibold">Cover letter (optional)
        <textarea name="coverLetter" rows={5} maxLength={4000} className={fieldStyle} />
      </label>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input name="acceptedConsent" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-emerald-700" />
        I agree that the admin may review my application and share my details and CV with this employer.
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="min-h-11 bg-[#007653] hover:bg-[#005c41]">
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
