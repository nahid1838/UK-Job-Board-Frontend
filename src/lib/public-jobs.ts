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
};

export async function getPublicJobs(filters = new URLSearchParams()) {
  const { jobs } = await backendRequest<{ jobs: PublicJob[] }>(
    `/api/jobs?${filters}`,
    { signal: AbortSignal.timeout(5000) },
  );
  return jobs;
}
