import { backendRequest } from "@/lib/backend";
import type { PublicJob } from "@/lib/public-jobs";

export type PublicCompany = { id: string; name: string; town: string; industry: string; jobCount: number; logoUrl?: string };

export async function getPublicCompanies() {
  const { companies } = await backendRequest<{ companies: PublicCompany[] }>("/api/companies", { signal: AbortSignal.timeout(5000) });
  return companies;
}

export function getPublicCompany(id: string) {
  return backendRequest<{ company: Omit<PublicCompany, "jobCount"> & { description: string; size: string; website: string }; jobs: PublicJob[] }>(
    `/api/companies/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(5000) },
  );
}
