const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function backendEndpoint(path: string) {
  return new URL(path, backendUrl);
}

export class BackendRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function backendRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(backendEndpoint(path), {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new BackendRequestError(data.message || "The request could not be completed.", response.status);
  return data;
}

export function backendErrorMessage(error: unknown) {
  if (error instanceof TypeError) return "Could not reach the backend. Check that it is running and retry.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
