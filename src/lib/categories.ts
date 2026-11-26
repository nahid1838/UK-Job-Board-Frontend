import { backendRequest } from "@/lib/backend";

export type Category = { _id: string; name: string; order: number };
export type CategoryWithCount = Category & { jobCount: number };

export async function getCategories(options?: RequestInit) {
  const { categories } = await backendRequest<{ categories: Category[] }>("/api/categories", options);
  return categories;
}

export async function getCategoriesWithCounts() {
  const { categories } = await backendRequest<{ categories: CategoryWithCount[] }>(
    "/api/categories?counts=true", { signal: AbortSignal.timeout(5000) },
  );
  return categories;
}
