import { backendRequest } from "@/lib/backend";

export type PublicJob = {
  _id: string;
  title: string;
  companyName: string;
  category: string;
  location: string;
  jobType: string;
  workMode: string;
  description: string;
  experience: string;
  closingDate: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string;
  rightToWork: boolean;
  postcode?: string;
  companyId?: string;
  companyLogo?: string;
  categoryId?: string;
  isFeatured?: boolean;
  publishedAt?: string;
};

export function getJobResults(filters = new URLSearchParams()) {
  return backendRequest<{ jobs: PublicJob[]; total: number; page: number; pages: number }>(
    `/api/jobs?${filters}`,
    { signal: AbortSignal.timeout(5000) },
  );
}

export async function getPublicJobs(filters?: URLSearchParams) {
  return (await getJobResults(filters)).jobs;
}

export async function getPublicJob(id: string) {
  const { job } = await backendRequest<{ job: PublicJob }>(`/api/jobs/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(5000) });
  return job;
}
